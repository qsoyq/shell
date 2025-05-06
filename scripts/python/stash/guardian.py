#!/usr/bin/env python3
import os
from datetime import datetime
import typer
import rich
import rich.errors
import httpx
from pathlib import Path

app = typer.Typer()


def echo(*args, **kwargs):
    if args:
        arg = f"[{get_current_datetime_str()}] {args[0]}"
        args = [arg, *args[1:]]
    try:
        rich.print(*args, **kwargs)
    except rich.errors.MarkupError:
        print(*args, **kwargs)


def get_current_datetime_str() -> str:
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


@app.command()
def main(endpoint: str = typer.Option("http://127.0.0.1:9090/", "--endpoint"), cmd: str = typer.Option("open /Applications/Stash.app/", "--cmd", help="启动命令")):
    try:
        httpx.get(endpoint)
    except httpx.ConnectError:
        exitcode = os.system(cmd)
        if exitcode:
            echo(f"execute {cmd} failed, exit: {exitcode}")
        else:
            echo(f"execute {cmd} successed, exit: {exitcode}")


if __name__ == "__main__":
    app()
