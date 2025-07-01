#!/usr/bin/env python3

import time
import httpx
import json
from pathlib import Path

import rich
from datetime import datetime
import typer


app = typer.Typer()


def echo(*args, **kwargs):
    if args:
        arg = f"[{get_current_datetime_str()}] {args[0]}"
        args = [arg, *args[1:]]
    rich.print(*args, **kwargs)


def get_current_datetime_str() -> str:
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


@app.command()
def main(
    url: str = typer.Option(
        "http://127.0.0.1:9090/connections",
        "-u",
        "--url",
        help="clash connections api endpoint",
    ),
    output: Path = typer.Option("./connections.json", "-o", "--output", help="输出路径"),
    interval: float = typer.Option(1, "--interval", help="连接数据写入文件的间隔时间"),
):
    result = set()
    while True:
        res = httpx.get(url)
        data = res.json()
        connections = data.get("connections", [])
        for connection in connections:
            metadata = connection.get("metadata", {})
            destinationIP = metadata.get("destinationIP")
            destinationPort = metadata.get("destinationPort")
            network = metadata.get("network")
            inbound = metadata.get("inbound")
            chain = ",".join(metadata.get("chain", []))
            ruleType = metadata.get("ruleType")

            host = metadata.get("host")
            result.add(
                (
                    network,
                    inbound,
                    host,
                    destinationIP,
                    destinationPort,
                    ruleType,
                    chain,
                )
            )
        out = [list(x) for x in result]
        data = json.dumps({"connections": out}, ensure_ascii=False, indent=4)
        output.write_text(data)
        time.sleep(interval)


if __name__ == "__main__":
    app()
