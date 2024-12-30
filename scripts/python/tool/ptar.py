#!/usr/bin/env python3
import tarfile
import hashlib
from pathlib import Path
from rich import print
from datetime import datetime
import typer


app = typer.Typer()


def echo(*args, **kwargs):
    if args:
        arg = f"[{get_current_datetime_str()}] {args[0]}"
        args = [arg, *args[1:]]
    print(*args, **kwargs)


def get_current_datetime_str() -> str:
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


@app.command()
def create(
    output: Path = typer.Argument(..., help="输出文件"),
    paths: list[Path] = typer.Argument(..., help="待压缩文件或目录"),
):
    """
    使用 tar 压缩文件
    """
    if output.is_dir():
        echo("[Error] Output path is a directory. Please specify a file path.")
        raise typer.Exit(1)

    files: list[Path] = []
    for path in paths:
        if not path.exists():
            echo(f"[Error] path {path} not exists")
            raise typer.Exit(2)
        files.append(path)
    files = sorted(set(files))
    for path in files:
        echo(f"[File] {path.name}\t{path} ")

    try:
        with tarfile.open(output, "w") as tar:
            for file in files:
                tar.add(file, arcname=file.relative_to(file.parent))
        echo(f"[Res] Tar file {output} created successfully.")
    except Exception as e:
        echo(f"[Error] Failed to create tar file: {e}")
        raise typer.Exit(3)


if __name__ == "__main__":
    app()
