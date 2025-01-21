#!/usr/bin/env python3
import sys
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
def parser(torrent: str = typer.Argument(..., help="种子信息")):
    """分析种子文件"""
    if torrent == "-":
        torrent = sys.stdin.read()
    pass


@app.command()
def create():
    """创建种子文件"""
    pass


if __name__ == "__main__":
    app()
