#!/usr/bin/env python3
import hashlib
from typing import List, Dict
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
def show(
    paths: list[Path] = typer.Argument(..., help="待遍历目录"),
):
    """
    遍历目录，根据文件 hash 值, 显示重复项
    """
    memo: Dict[str, List[Path]] = defaultdict(list)
    for p in paths:
        if not p.exists():
            echo("path must be exists")
            raise typer.Exit(2)
        if not p.is_dir():
            echo(p)
            echo("path must be directory")
            raise typer.Exit(1)
        for file in p.rglob("*"):
            if file.is_file():
                hashv = compute_file_hash(file)
                memo[hashv].append(file)
        for hashv, li in memo.items():
            for x in li[1:]:
                echo(f"{hashv} {x.name} {x.absolute()} is duplicate")


@app.command()
def delete(
    paths: list[Path] = typer.Argument(..., help="待遍历目录"),
):
    """
    遍历目录，根据文件 hash 值, 删除重复项
    """
    memo: Dict[str, List[Path]] = defaultdict(list)
    for p in paths:
        if not p.exists():
            echo("path must be exists")
            raise typer.Exit(2)
        if not p.is_dir():
            echo(p)
            echo("path must be directory")
            raise typer.Exit(1)
        for file in p.rglob("*"):
            if file.is_file():
                hashv = compute_file_hash(file)
                memo[hashv].append(file)
        for hashv, li in memo.items():
            for x in li[1:]:
                x.unlink()


if __name__ == "__main__":
    app()
