#!/usr/bin/env python3
import time
from pathlib import Path
from rich import print
from datetime import datetime
import typer
from collections import defaultdict

app = typer.Typer()


def echo(*args, **kwargs):
    if args:
        arg = f"[{get_current_datetime_str()}] {args[0]}"
        args = [arg, *args[1:]]
    print(*args, **kwargs)


def get_current_datetime_str():
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


@app.command()
def show(
    dest: Path = typer.Option(..., "-d", "--dir", help="目录"),
):
    """
    遍历目录，根据文件 hash 值记录重复项
    """
    # echo("hello, world")
    if not dest.is_dir():
        echo("dir must be folder")
        raise typer.Exit(1)
    memo = defaultdict(list)

    for p in dest.rglob("*"):
        if p.is_file():
            # echo(p.absolute(), p.name)
            memo[p.name].append(p.absolute())
    for k, li in memo.items():
        echo(f"{k}, count: {len(li)}")


if __name__ == "__main__":
    app()
