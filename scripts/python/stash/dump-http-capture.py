#!/usr/bin/env python3
"""
cp /Users/qs/works/github/shell/scripts/python/stash/dump-http-capture.py /usr/local/bin/shcp && chmod +x /usr/local/bin
"""

import re
import json
import typer
import sys
import urllib.parse
from typing import Generator
from datetime import datetime
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

import rich
import rich.errors
import httpx
from pydantic import BaseModel, Field


class Request(BaseModel):
    url: str
    method: str
    headers: dict
    body: str | None = Field(None)


class Response(BaseModel):
    status: int
    headers: dict
    body: str | None = Field(None)
    json_: object | None = Field(None, alias='json')


class Dev(BaseModel):
    timestamp: int = Field(..., description="秒时间戳")
    curl: str = Field(..., description="curl 命令")


class Body(BaseModel):
    request: Request
    response: Response
    dev: Dev


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


def stdin_input() -> str:
    return sys.stdin.read()


def parse_json(text) -> tuple[dict | None, str | None]:
    try:
        body = json.loads(text)
        return (body, None)
    except json.decoder.JSONDecodeError as e:
        return (None, str(e))


def parse_log(file: Path) -> Generator[dict | None, None, None]:
    if not file.exists():
        echo(f"path {file} not exists.")
        raise typer.Exit(1)

    if not file.is_file():
        echo(f"path {file} must be file.")
        raise typer.Exit(2)

    for line in file.read_text().split("\n"):
        if line[12:16] == "JSON":
            jsonstr = line[18:]
            body, err = parse_json(jsonstr)
            if err is not None:
                echo(f"parse json error: {err}\traw:{jsonstr}")
            else:
                yield body


def fetch_media(url: str, *, prefix="shcp") -> None:
    try:
        echo(f"url: {url}")
        parse_result = urllib.parse.urlparse(url)
        download_path = (
            prefix
            + parse_result.netloc
            + parse_result.path[0]
            + parse_result.path[1:].replace("/", "-")
        )
        path = Path(download_path)
        if path.exists():
            echo(f"file {path} exists, skip")
            return

        path.parent.mkdir(parents=True, exist_ok=True)
        resp = httpx.get(
            url,
            verify=False,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
            },
        )
        if resp.is_error:
            echo(f"fetch {url} error: {resp.status_code}, body: {resp.text}")
            return
        ct = resp.headers.get("content-type", "")

        if ct.startswith("image/") or ct.startswith("video/"):
            ext = str(resp.headers.get("content-type", "")).split("/", 1)[-1]
            path = path.with_suffix(f".{ext}")
        if path.exists():
            echo(f"file {path} exists, skip")
            return
        path.write_bytes(resp.content)
    except Exception as e:
        echo(f"fetch {url} error: {e}")
        return


def fetch_image(url: str, *, prefix="shcp/image/") -> None:
    return fetch_media(url, prefix=prefix)


def fetch_video(url: str, *, prefix="shcp/video/") -> None:
    return fetch_media(url, prefix=prefix)


@app.command()
def download(
    file: Path = typer.Argument(..., help="日志文件路径"),
):
    """下载图片和视频"""
    image_urls = []
    video_urls = []
    for line in parse_log(file):
        if not line:
            continue

        body = Body(**line)
        if "image" in body.response.headers.get("Content-Type", ""):
            image_urls.append(body.request.url)
        if "video" in body.response.headers.get("Content-Type", ""):
            video_urls.append(body.request.url)

    with ThreadPoolExecutor() as executor:
        for url in image_urls:
            fetch_image(url)
            executor.submit(fetch_image, url)

        for url in video_urls:
            executor.submit(fetch_video, url)

        executor.shutdown(wait=True)


@app.command()
def urls(
    file: Path = typer.Argument(..., help="日志文件路径"),
    dest: Path = typer.Option("-", "--dest", help="结果输出路径, 默认标准输出"),
    uniq: bool = typer.Option(True, "--uniq", help="去重"),
    sort: bool = typer.Option(True, "--sort", help="对结果排序"),
):
    """返回所有请求的 URL"""
    urls = [line["request"]["url"] for line in parse_log(file) if line]

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
