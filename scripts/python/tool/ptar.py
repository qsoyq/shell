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


def compute_file_hash(file_path: Path) -> str:
    """Compute the hash of a file."""
    hash_md5 = hashlib.md5()  # You can choose other hashing algorithms like sha256
    with file_path.open("rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()


@app.command()
def create(
    output: Path = typer.Argument(..., help="输出文件"),
    paths: list[Path] = typer.Argument(..., help="待压缩文件或目录"),
):
    """
    使用 tar 压缩文件
    """
    if output.is_dir():
        echo("[Error] 输出路径已存在文件")
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

    with tarfile.open(output, "w") as tar:
        for file in files:
            tar.add(file, recursive=True, arcname=file.name)
    echo(f"[Res] Tar file {output} created successfully.")


if __name__ == "__main__":
    app()
