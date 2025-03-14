#!/usr/bin/env python3
import re
import json
import rich
from datetime import datetime
from pathlib import Path
import typer
import sys
import urllib.parse
import base64


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


def parse_json(text) -> tuple[object | None, str | None]:
    try:
        body = json.loads(text)
        return (body, None)
    except json.decoder.JSONDecodeError as e:
        return (None, str(e))


def parse_log(file: Path) -> list[dict]:
    ret = []
    if not file.exists():
        echo(f"path {file} not exists.")
        raise typer.Exit(1)

    if not file.is_file():
        echo(f"path {file} must be file.")
        raise typer.Exit(2)

    for line in file.read_text().split("\n"):
        if "[JSON]" in line:
            index = line.index("[JSON]")
            jsonstr = line[index + 7 :]
            body, err = parse_json(jsonstr)
            if err is not None:
                echo(f"parse json error: {err}\traw:{jsonstr}")
            else:
                ret.append(body)
    return ret


@app.command()
def find():
    pass


@app.command()
def urls(
    file: Path = typer.Argument(..., help="日志文件路径"),
    dest: Path = typer.Option("-", "--dest", help="结果输出路径, 默认标准输出"),
    uniq: bool = typer.Option(True, "--uniq", help="去重"),
    sort: bool = typer.Option(True, "--sort", help="对结果排序"),
):
    """分析 url"""
    lines = parse_log(file)
    urls = [line["request"]["url"] for line in lines]

    hosts = []
    for url in urls:
        result = re.match("https?://([^/]*)/(.*)?", url)
        if result:
            hosts.append(result.groups()[0])

    if uniq:
        urls = list(set(urls))

    if sort:
        urls.sort()

    if str(dest) == "-":
        for url in urls:
            print(url)

    if not dest.exists() or dest.is_file():
        dest.write_text("\n".join(urls))


if __name__ == "__main__":
    app()
