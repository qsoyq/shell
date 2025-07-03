#!/usr/bin/env python3
import os
import toml
import sys
import select
from pathlib import Path
import rich
from datetime import datetime
import typer
import inspect


app = typer.Typer(help="systemctl 配置文件生成")


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


CONFIG_TEMPLATE = """
# /etc/systemd/system/{name}.service
[Unit]
Description={desc}
Documentation={document}
After={after}

[Service]
User=nobody
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
NoNewPrivileges=true
ExecStart=/usr/local/bin/xray run -config /usr/local/etc/xray/config.json
Restart=on-failure
RestartPreventExitStatus=23
LimitNPROC=10000
LimitNOFILE=1000000

[Install]
WantedBy=multi-user.target

# /etc/systemd/system/xray.service.d/10-donot_touch_single_conf.conf
# In case you have a good reason to do so, duplicate this file in the same directory and make your customizes there.
# Or all changes you made will be lost!  # Refer: https://www.freedesktop.org/software/systemd/man/systemd.unit.html
[Service]
ExecStart=
ExecStart=/usr/local/bin/xray run -config /usr/local/etc/xray/config.json
"""


@app.command()
def main(
    name: str = typer.Option("Example"),
    desc: str | None = typer.Option(None),
    document: str = typer.Option(""),
    after: str = typer.Option("network.target nss-lookup.target"),
    output: str = typer.Option("-", help="配置输出路径， 默认`-`为输出到标准输出"),
):
    """"""
    if not desc:
        desc = f"{name} Service"
    kwargs = {
        "name": name,
        "desc": desc,
        "document": document,
        "after": after,
    }
    final = inspect.cleandoc(CONFIG_TEMPLATE.format(**kwargs))
    if output == "-":
        print(final)


if __name__ == "__main__":
    app()
