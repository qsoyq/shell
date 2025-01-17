#!/usr/bin/env python3
import os
import rich
from datetime import datetime
import typer
from pathlib import Path


app = typer.Typer()


def echo(*args, **kwargs):
    if args:
        arg = f"[{get_current_datetime_str()}] {args[0]}"
        args = [arg, *args[1:]]
    rich.print(*args, **kwargs)


def get_current_datetime_str() -> str:
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


@app.command()
def main():
    p = Path("/var/lib/docker/containers")
    for d in p.iterdir():
        if d.is_dir():
            for f in d.rglob("*.log"):
                echo(f)
                cmd = f"cat /dev/null > {f.absolute()}"
                os.system(cmd)


if __name__ == "__main__":
    app()
