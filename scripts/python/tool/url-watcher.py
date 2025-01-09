#!/usr/bin/env python3
#
import rich
import subprocess
import shlex
from pathlib import Path
from datetime import datetime
import typer
import re
import httpx


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
    url: str = typer.Argument(..., help="资源地址"),
    pattern: str = typer.Option(..., "-p", "--pattern", help="正则表达式"),
    file: Path = typer.Option(..., "-f", "--file", help="资源唯一标识缓存文件路径"),
    cb: str = typer.Option(..., "--cb", help="发现资源更新时执行的命令"),
):
    if not file.exists():
        file.parent.mkdir(parents=True, exist_ok=True)
        file.touch()

    if not file.is_file():
        echo("file must be file")
        raise typer.Exit(2)

    last = file.read_text()
    resp = httpx.get(url, verify=False)
    resp.raise_for_status()
    result = re.search(pattern, resp.text)
    if not result:
        echo("search failed.")
        raise typer.Exit(1)

    matched = result.group(1)
    if last != matched:
        if last:
            echo(f"{last} -> {matched}")
        else:
            echo(f"new value: {matched}")
        cmd = shlex.split(cb)
        p = subprocess.run(cmd, capture_output=True, text=True)
        if p.returncode:
            echo(f"execute {cb} failed.")
            echo(f"stdout: {p.stdout}")
            echo(f"stderr: {p.stderr}")
            raise typer.Exit(p.returncode)

        file.write_text(matched)
        echo("write success")
    else:
        echo(f"current value: {matched}")


if __name__ == "__main__":
    app()
