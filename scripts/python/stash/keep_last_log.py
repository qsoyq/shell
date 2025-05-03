#!/usr/bin/env python3
import typer
from datetime import datetime
from pathlib import Path
import rich
import rich.errors

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
def main(
    path: Path = typer.Argument(Path("."), help="日志文件夹路径"),
):
    if not path.exists() or not path.is_dir():
        echo(f"invalid path: {path}")
    files = sorted([file for file in path.iterdir() if file.is_file()])
    if len(files) > 1:
        for file in files[:-1]:
            print(file.name)
            file.unlink()


if __name__ == "__main__":
    app()
