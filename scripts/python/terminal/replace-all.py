#!/usr/bin/env python3
from rich import print
import typer
from pathlib import Path
import sys


def main(
    # path: Path = typer.Argument(..., help="待处理的文件"),
    old: str = typer.Argument(..., help="替换前的字符串"),
    new: str = typer.Argument(..., help="替换后的字符串"),
):
    """
    从标准输入读取字符串替换后输出
    """
    data = sys.stdin.read()
    if data:
        data = data.replace(old, new)
        print(data)
    # if path.exists() and path.is_file():
    #     with path.open("r") as f:
    #         data = f.read()
    #     data = data.replace(old, new)
    #     print(data)


if __name__ == "__main__":
    typer.run(main)
