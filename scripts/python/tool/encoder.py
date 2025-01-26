#!/usr/bin/env python3

import rich
from datetime import datetime
import typer
import sys
import urllib.parse


app = typer.Typer()


def echo(*args, **kwargs):
    if args:
        arg = f"[{get_current_datetime_str()}] {args[0]}"
        args = [arg, *args[1:]]
    rich.print(*args, **kwargs)


def get_current_datetime_str() -> str:
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


def stdin_input() -> str:
    return sys.stdin.read()


@app.command()
def quote(
    data: str = typer.Argument(..., help="输入字符串. `-`表示从标准输入获取"),
    end: str = typer.Option("", help="输出追加字符"),
):
    """url 编码"""
    if data == "-":
        data = stdin_input()
    print(urllib.parse.quote(data), end=end)
    pass


@app.command()
def unquote(
    data: str = typer.Argument(..., help="输入字符串. `-`表示从标准输入获取"),
    end: str = typer.Option("", help="输出追加字符"),
):
    """url 解码"""
    if data == "-":
        data = stdin_input()
    print(urllib.parse.unquote(data), end=end)
    pass


if __name__ == "__main__":
    app()
