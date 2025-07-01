#!/usr/bin/env python3
import os
import toml
import sys
import select
from pathlib import Path
import rich
from datetime import datetime
import typer


app = typer.Typer()


def is_root() -> bool:
    return os.geteuid() == 0


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


def parse_ports(listen_port: str) -> list[int]:
    ports = []
    for port in listen_port.split(","):
        if port.isdigit():
            ports.append(port)
        if port.count("-") == 1:
            start, end = port.split("-")
            ports.extend(list(range(int(start), int(end) + 1)))
    return ports


@app.command()
def main(
    log_level: str = typer.Option("off"),
    log_output: str = typer.Option("/var/log/realm.log"),
    no_tcp: bool = typer.Option(False),
    use_udp: bool = typer.Option(True),
    listen_host: str = typer.Option("0.0.0.0", help="本地监听主机地址"),
    listen_port: str = typer.Option(..., help="本地监听主机端口, 支持指定端口和端口范围, 如`443,8110-8113`"),
    remote_host: str = typer.Option("127.0.0.1", help="远程主机地址"),
    remote_port: str = typer.Option("443", help="远程主机端口"),
    output: str = typer.Option("-", help="配置输出路径， 默认`-`为输出到标准输出"),
):
    """https://github.com/zhboner/realm

    realm 安装命令

    wget https://github.com/zhboner/realm/releases/download/v2.7.0/realm-x86_64-unknown-linux-gnu.tar.gz -O - | tar -xz -C /usr/local/bin/
    """
    if not is_root():
        echo("必须以 root 用户运行")
        raise typer.Exit(1)

    if listen_port is None:
        listen_port = input_with_timeout("回车或等待15秒为默认端口443，或者自定义端口请输入(1-65535)：", 15) or "443"
    local_ports = parse_ports(listen_port)
    endpoints = [{"listen": f"{listen_host}:{port}", "remote": f"{remote_host}:{remote_port}"} for port in local_ports]
    config = {
        "log": {"level": log_level, "output": log_output},
        "network": {"no_tcp": no_tcp, "use_udp": use_udp},
        "endpoints": endpoints,
    }
    if output == "-":
        print(toml.dumps(config))
    else:
        path = Path(output).expanduser()
        if path.is_dir():
            echo("输出路径不可以是目录")
            raise typer.Exit(2)
        path.write_text(toml.dumps(config))


if __name__ == "__main__":
    app()
