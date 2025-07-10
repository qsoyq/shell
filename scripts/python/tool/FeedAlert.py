#!/usr/bin/env python3
from datetime import datetime
import typer
import rich
import rich.errors
import shelve
from pathlib import Path
import httpx
from pydantic import BaseModel, Field
import xmltodict

app = typer.Typer()


class ChannelImage(BaseModel):
    url: str | None = Field(None)
    title: str | None = Field(None)
    link: str | None = Field(None)


class GUID(BaseModel):
    isPermaLink: str | None = Field(None, alias="@isPermaLink")
    text: str | None = Field(None, alias="@text")

    def __str__(self) -> str:
        return self.__repr__()

    def __repr__(self) -> str:
        return f"{self.isPermaLink}\n{self.text}"


class Entry(BaseModel):
    title: str = Field(...)
    description: str | None = Field("")
    link: str = Field(...)
    guid: GUID = Field(...)
    pubDate: str = Field(...)

    def __str__(self) -> str:
        return self.__repr__()

    def __repr__(self) -> str:
        return f"{self.title}\n{self.description}\n{self.link}\n{self.guid}\n{self.pubDate}"


class Feed(BaseModel):
    title: str = Field(...)
    description: str = Field(...)
    link: str = Field(...)
    item: list[Entry] = Field(...)
    image: ChannelImage | None = Field(None)

    def __str__(self) -> str:
        return self.__repr__()

    def __repr__(self) -> str:
        return f"{self.title}\n{self.description}\n{self.link}"


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


class ShelveStorage:
    def __init__(self, path: str | Path):
        if isinstance(path, str):
            path = Path(path).expanduser()
        self.path = path

    def _get(self, key):
        if not self.path.exists():
            return None
        with shelve.open(str(self.path), "r") as shl:
            return shl.get(key)

    def _set(self, key, value):
        with shelve.open(str(self.path), "c") as shl:
            shl[key] = value

    def __setitem__(self, key, value):
        return self._set(key, value)

    def __getitem__(self, key):
        return self._get(key)

    def keys(self):
        with shelve.open(str(self.path), "r") as shl:
            for key in shl:
                yield key

    def iterall(self):
        if not self.path.exists():
            return
        with shelve.open(str(self.path), "r") as shl:
            for key in shl:
                yield (key, shl[key])


def make_push_messages(entries: list[Entry], bark_token: str, icon: str | None, level: str | None, group: str | None) -> dict:
    messages = []
    for entry in entries:
        payload = {
            "bark": {
                "device_key": bark_token,
                "title": entry.title,
                "body": f"{entry.description or ''}\n{entry.pubDate}",
                "level": level,
                "icon": icon,
                "group": group,
                "url": entry.link,
            }
        }
        messages.append(payload)
    return {"messages": messages}


@app.command()
def main(
    url: str = typer.Argument(..., help="rss 订阅地址"),
    cachepath: Path = typer.Option("~/.FeedAlert", "--cachepath", help="持久化存储目录"),
    bark_token: str | None = typer.Option(None, "--bark-token", help="Bark 推送 API Token"),
    bark_icon: str | None = typer.Option(None, "--bark-icon"),
    bark_level: str | None = typer.Option(None, "--bark-level", help="'active', 'timeSensitive', or 'passive', or 'critical'"),
    bark_group: str | None = typer.Option(None, "--bark-group"),
    verbose: bool = typer.Option(True, help="详细输出"),
    block_words: list[str] | None = typer.Option(None, help="屏蔽关键词"),
):
    cachepath = cachepath.expanduser()
    shl = ShelveStorage(cachepath)
    if bark_token is None:
        bark_token = shl["bark_token"]
    if not bark_token:
        echo("not exists bark token.")
        raise typer.Exit(1)

    resp = httpx.get(url)
    resp.raise_for_status()
    body = xmltodict.parse(resp.text)
    channel = body.get("rss", {}).get("channel", {})
    feed = Feed(**channel)
    if verbose:
        echo(f"[Feed]\n{feed}")

    for item in feed.item:
        if block_words:
            skip = False
            for word in block_words:
                if word.lower() in item.title.lower():
                    skip = True
                    break
            if skip:
                echo(f"skip {item.title} because of block word: {word}")
                continue
        item.description = item.description or ""
        if verbose:
            echo(f"[Entry]\n{item}")
        keyname = f"{item.guid.text or item.link} - {item.pubDate}"
        if shl[keyname]:
            continue
        if bark_icon is None and feed.image and feed.image.url:
            bark_icon = feed.image.url
        payload = make_push_messages([item], bark_token, bark_icon, bark_level, bark_group)
        url = "https://p.19940731.xyz/api/notifications/push/v3"
        if verbose:
            echo(f"[Push Payload]:{payload}")

        resp = httpx.post(url, json=payload)
        resp.raise_for_status()
        shl[keyname] = keyname


@app.command()
def update_env(
    cachepath: Path = typer.Option("~/.FeedAlert", "--cachepath", help="持久化存储目录"),
    bark_token: str = typer.Option(None, "--bark-token", prompt="输入 Bark Token", help="Bark 推送 API Token"),
):
    cachepath = cachepath.expanduser()
    shl = ShelveStorage(cachepath)
    if bark_token:
        shl["bark_token"] = bark_token
        echo("更新 bark_token 成功")


@app.command()
def env(cachepath: Path = typer.Option("~/.FeedAlert", "--cachepath", help="持久化存储目录")):
    cachepath = cachepath.expanduser()
    shl = ShelveStorage(cachepath)
    envs = ["bark_token"]
    for env in envs:
        echo(f"{env}: {shl[env]}")


@app.callback()
def callback(cachepath: Path = typer.Option("~/.FeedAlert", "--cachepath", help="持久化存储目录")):
    cachepath = cachepath.expanduser()
    if cachepath.is_dir():
        echo(f"{cachepath} must not be folder")
        raise typer.Exit(-2)


if __name__ == "__main__":
    app()
