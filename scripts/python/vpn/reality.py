#!/usr/bin/env python3
import os
import json
import sys
import select
import rich
from datetime import datetime
from uuid import uuid4
import typer
from subprocess import run, CompletedProcess
import shlex
from pathlib import Path


app = typer.Typer()

xray_config_template = {
    "log": {
        "loglevel": "warning",
    },
    "inbounds": [
        {
            "port": 443,
            "protocol": "vless",
            "tag": "vless_tls",
            "settings": {"clients": [{"id": "", "flow": "xtls-rprx-vision"}], "decryption": "none"},
            "streamSettings": {
                "network": "tcp",
                "security": "reality",
                "realitySettings": {
                    "show": False,
                    "dest": "www.amazon.com:443",
                    "xver": 0,
                    "serverNames": ["www.amazon.con"],
                    "privateKey": "",
                    "minClientVer": "",
                    "maxClientVer": "",
                    "maxTimeDiff": 0,
                    "shortIds": ["88"],
                },
            },
            "sniffing": {"enabled": True, "destOverride": ["http", "tls", "quic"]},
        }
    ],
    "outbounds": [{"protocol": "freedom", "tag": "direct"}, {"protocol": "blackhole", "tag": "block"}],
    "routing": {"rules": [], "domainStrategy": "AsIs"},
}


def install_xray():
    if Path("/usr/bin/apt-get").exists():
        cmd = "apt-get update -y && apt-get upgrade -y && apt-get install -y gawk curl"
    else:
        cmd = "yum update -y && yum upgrade -y && yum install -y epel-release && yum install -y gawk curl"
    exitcode = os.system(cmd)
    if exitcode != 0:
        echo("install devtools failed")
        typer.Exit(5)
    exitcode = os.system('bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install')
    if exitcode != 0:
        echo("install xray failed")
        typer.Exit(5)


def get_xray_key() -> tuple[str, str]:
    cmd = "/usr/local/bin/xray x25519"
    p = run(shlex.split(cmd), capture_output=True)
    if p.returncode != 0:
        err = "\n".join([p.stderr.decode(), p.stdout.decode()])
        echo(f"初始化密钥失败, error: {err}")
        raise typer.Exit(3)
    text = p.stdout.decode().strip()
    private_key, public_key = list(map(lambda x: x.split(" ")[-1], text.split("\n")))
    return private_key, public_key


def is_root() -> bool:
    return os.geteuid() == 0


def get_v4_ip() -> tuple[CompletedProcess, str | None]:
    cmd = "curl -s -4 http://www.cloudflare.com/cdn-cgi/trace"

    p: CompletedProcess = run(shlex.split(cmd), capture_output=True)
    if p.returncode != 0:
        return p, None
    text: str = p.stdout.decode()
    if isinstance(text, str):
        text = text.strip()
        d = {k: v for k, v in (item.split("=", 1) for item in text.split("\n"))}
        return p, d.get("ip")
    echo(p.returncode, text)
    return (p, text)


def get_v6_ip() -> tuple[CompletedProcess, str | None]:
    cmd = "curl -s -6 http://www.cloudflare.com/cdn-cgi/trace"

    p: CompletedProcess = run(shlex.split(cmd), capture_output=True)
    if p.returncode != 0:
        return p, None
    text: str = p.stdout.decode()
    if isinstance(text, str):
        text = text.strip()
        d = {k: v for k, v in (item.split("=", 1) for item in text.split("\n"))}
        return p, d.get("ip")
    echo(p.returncode, text)
    return (p, text)


def enable_xray():
    cmd = "systemctl enable xray.service && systemctl restart xray.service"
    exitcode = os.system(cmd)
    if exitcode != 0:
        echo("启动 xray 失败")
        raise typer.Exit(6)


def echo(*args, **kwargs):
    if args:
        arg = f"[{get_current_datetime_str()}] {args[0]}"
        args = [arg, *args[1:]]
    rich.print(*args, **kwargs)


def get_current_datetime_str() -> str:
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


def input_with_timeout(prompt: str, timeout: float | None = None):
    sys.stdout.write(prompt)
    sys.stdout.flush()
    ready, _, _ = select.select([sys.stdin], [], [], timeout)

    if ready:
        return sys.stdin.readline().strip()
    else:
        return None


@app.command()
def main(
    loglevel: str = typer.Option("warning"),
    access_log: str = typer.Option("/var/log/xray/access.log"),
    error_log: str = typer.Option("/var/log/xray/error.log"),
    sni: str | None = typer.Option(None),
    sniff: bool | None = typer.Option(None),
    port: str | None = typer.Option(None),
    uuid: str | None = typer.Option(None),
    short_ids: str | None = typer.Option(None),
    public_key: str | None = typer.Option(None),
    private_key: str | None = typer.Option(None),
):
    if not is_root():
        echo("必须以 root 用户运行")
        raise typer.Exit(1)
    if port is None:
        port = input_with_timeout("回车或等待15秒为默认端口443，或者自定义端口请输入(1-65535)：", 15) or "443"
    if sni is None:
        sni = input_with_timeout("回车或等待15秒为默认域名 www.amazon.com，或者自定义SNI请输入：", 15) or "www.amazon.com"
    if sniff is None:
        sniff = (input_with_timeout("回车或等待15秒为默认关闭sniffing，启用请输入 y/Y：", 15) or "n").lower() == "y"
    if short_ids is None:
        short_ids = input_with_timeout("回车或等待15秒为默认88，或者自定义输入", 15) or "88"
    if uuid is None:
        uuid = str(uuid4())
    echo(port, sni, sniff)
    p, addr = get_v4_ip()
    if not addr:
        p2, addr = get_v6_ip()

    if not addr:
        echo("获取 IP 失败")
        echo(p.stdout.decode())
        echo(p2.stdout.decode())
        raise typer.Exit(2)

    install_xray()
    if public_key is None and private_key is None:
        private_key, public_key = get_xray_key()
    elif public_key is None or private_key is None:
        echo("The public_key and private_key must be provided together.")
        raise typer.Exit(3)
    xray_config_template["log"]["loglevel"] = loglevel
    if access_log:
        xray_config_template["log"]["access"] = access_log
    if error_log:
        xray_config_template["log"]["error"] = error_log
    xray_config_template["inbounds"][0]["port"] = port
    xray_config_template["inbounds"][0]["sniffing"]["enabled"] = sniff
    xray_config_template["inbounds"][0]["settings"]["clients"][0]["id"] = uuid
    xray_config_template["inbounds"][0]["streamSettings"]["realitySettings"]["dest"] = f"{sni}:443"
    xray_config_template["inbounds"][0]["streamSettings"]["realitySettings"]["shortIds"] = [short_ids]
    xray_config_template["inbounds"][0]["streamSettings"]["realitySettings"]["serverNames"] = [f"{sni}"]
    xray_config_template["inbounds"][0]["streamSettings"]["realitySettings"]["privateKey"] = private_key

    client_info = {"port": port, "address": addr, "uuid": uuid, "public key": public_key, "sni": sni, "shortIds": short_ids}
    xray_config_path = Path("/usr/local/etc/xray/config.json")
    xray_config_path.touch()
    xray_config_path.write_text(json.dumps(xray_config_template, indent=4))

    client_info_path = Path("/usr/local/etc/xray/reclient.json")
    client_info_path.touch()
    client_info_path.write_text(json.dumps(client_info, indent=4))

    enable_xray()

    echo("服务端配置: /usr/local/etc/xray/config.json")
    echo("客户端配置: /usr/local/etc/xray/reclient.json")
    echo(f"vless://{uuid}@{addr}:{port}?encryption=none&flow=xtls-rprx-vision&security=reality&sni={sni}&fp=chrome&pbk={public_key}&sid={short_ids}&type=tcp&headerType=none")
    print(json.dumps(client_info, indent=4))
    echo("xray关闭: systemctl enable xray.service")
    echo("xray重启: systemctl restart xray.service")
    echo("xray状态查询: systemctl status xray.service")


if __name__ == "__main__":
    app()
