#!/usr/bin/env python3
import sys
import rich
from datetime import datetime
import typer
import textwrap
from tabulate import tabulate
from typing import List, Any, Dict

import pyperclip

app = typer.Typer()


def echo(*args, **kwargs):
    if args:
        arg = f"[{get_current_datetime_str()}] {args[0]}"
        args = [arg, *args[1:]]
    rich.print(*args, **kwargs)


def get_current_datetime_str() -> str:
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


def is_number(val: str) -> bool:
    try:
        float(val)
        return True
    except ValueError:
        pass
    return False


@app.command()
def sort(
    sort_keys: List[str] = typer.Argument(..., help="基于指定字段排序"),
    reverse: bool = typer.Option(False, help="是否倒序"),
    clipboard: bool = typer.Option(False, help="是否从剪切板中读取输入"),
):
    """默认从标准输入中读取
    可设置 clipboard 改为从剪切板中读取
    """
    if clipboard:
        data = pyperclip.paste()
    else:
        data = sys.stdin.read()

    content = [x for x in data.split("\n") if x]
    if not content:
        echo("markdown table text not found")
        raise typer.Exit(1)
    cnt = content[0].count("|")
    for line in content:
        assert line.count("|") == cnt, line
    headers = [] if not content else content[0].split("|")
    headers = [x.strip() for x in headers if x.strip()]
    body = content[2:]
    body = [[y.strip() for y in x.split("|") if y.strip()] for x in body]
    body = [[float(y) if is_number(y) else y for y in x] for x in body]

    tables = []
    for line in body:
        row = {k: v for k, v in zip(headers, line)}
        tables.append(row)

    tables = sorted(
        tables, key=lambda x: tuple(x.get(k, None) for k in sort_keys), reverse=reverse
    )

    sorted_table: List[List] = []
    for row in tables:
        line = [row[k] for k in headers]
        sorted_table.append(line)

    rich.print(tabulate(sorted_table, headers, tablefmt="github"))
    pass


if __name__ == "__main__":
    app()
