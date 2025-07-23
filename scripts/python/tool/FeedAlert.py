#!/usr/bin/env python3
import html
from datetime import datetime
import dateparser
import typer
import rich
import rich.errors
import shelve
import json
from pathlib import Path
import httpx
from pydantic import BaseModel, Field
import xmltodict

version = "0.2.2"
help = f"""
订阅 RSS, 并转发到 Bark 通知
支持 rss/atom/jsonfeed 版本的 rss 订阅.

Version: {version}
"""
app = typer.Typer()


class FeedInfo(BaseModel):
    title: str
    description: str
    home_page_url: str | None = Field(None)
    feed_url: str | None = Field(None)
    icon: str | None = Field(None)
    favicon: str | None = Field(None)


class FeedItem(BaseModel):
    id: str = Field(...)
    link: str = Field(...)
    title: str = Field(...)
    content: str | None = Field(None)
    created: datetime | None = Field(None)
    updated: datetime | None = Field(None)


class MyFeed(BaseModel):
    info: FeedInfo
    items: list[FeedItem]


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


class FeedParser:
    def __init__(self, body: str, content_type: str):
        self._body = body
        version = None
        if "application/atom+xml" in content_type:
            version = "atom"
        elif "application/json" in content_type:
            version = "jsonfeed"
        elif "application/xml" in content_type:
            version = "rss"
        else:
            try:
                data = xmltodict.parse(body)
                if data.get("rss", {}).get("channel"):
                    version = "rss"
                elif data.get("feed"):
                    version = "atom"
            except Exception:
                pass
            try:
                data = json.loads(body)
                version = "jsonfeed"
            except json.JSONDecodeError:
                pass
        if not version:
            raise ValueError("Invalid version")
        self.version = version

    def parse(self) -> MyFeed:
        version = self.version
        if version == "atom":
            return self._parse_atom()
        elif version == "jsonfeed":
            return self._parse_json()
        elif version == "rss":
            return self._parse_rss()
        raise ValueError("Invalid version")

    def _parse_rss(self) -> MyFeed:
        data = xmltodict.parse(self._body).get("rss", {}).get("channel")
        image_url = data.get("image", {}).get("url")
        info = FeedInfo(
            title=data["title"],
            description=data["description"],
            home_page_url=data.get("link"),
            feed_url=data.get("link"),
            icon=image_url,
            favicon=image_url,
        )
        items: list[FeedItem] = []
        for item in data["item"]:
            items.append(
                FeedItem(
                    id=item["guid"]["#text"],
                    link=item["link"],
                    title=item["title"],
                    content=item.get("description"),
                    created=dateparser.parse(item["pubDate"]),
                    updated=None,
                )
            )
            items[-1].updated = items[-1].created

        return MyFeed(info=info, items=items)

    def _parse_atom(self) -> MyFeed:
        data = xmltodict.parse(self._body)["feed"]
        links = {link["@rel"]: link["@href"] for link in data.get("link", [])}

        info = FeedInfo(
            title=data["title"],
            description=data["subtitle"],
            home_page_url=links.get("alternate"),
            feed_url=links.get("self"),
            icon=data.get("icon"),
            favicon=data.get("favicon"),
        )
        items: list[FeedItem] = []

        for item in data["entry"]:
            items.append(
                FeedItem(
                    id=item["id"],
                    link=item.get("link", {}).get("@href"),
                    title=item["title"],
                    content=item.get("content", {}).get("#text"),
                    created=dateparser.parse(item["published"]),
                    updated=dateparser.parse(item["updated"]),
                )
            )

        return MyFeed(info=info, items=items)

    def _parse_json(self) -> MyFeed:
        data = json.loads(self._body)
        info = FeedInfo(
            title=data["title"],
            description=data["description"],
            home_page_url=data.get("home_page_url"),
            feed_url=data.get("feed_url"),
            icon=data.get("icon"),
            favicon=data.get("favicon"),
        )
        items: list[FeedItem] = []
        for item in data["items"]:
            items.append(FeedItem(id=item["id"], link=item["url"], title=item["title"], content=item.get("content_html"), created=dateparser.parse(item["date_published"]), updated=None))
            items[-1].updated = items[-1].created

        return MyFeed(info=info, items=items)


def make_push_messages(entry: FeedItem, bark_token: str, icon: str | None, level: str | None, group: str | None) -> dict:
    payload = {
        "bark": {
            "device_key": bark_token,
            "title": entry.title,
            "body": f"{entry.content or ''}\n{entry.created}"[:1024],
            "level": level,
            "icon": icon,
            "group": group,
            "url": entry.link,
        }
    }
    return {"messages": [payload]}


def get_cache_key(item: FeedItem, timecache: bool = False) -> str:
    keyname = f"{item.id or item.link} - {item.updated or item.created}" if timecache is True else f"{item.id or item.link}"
    return keyname


def filter_by_block(items: list[FeedItem], block_words: list[str]) -> list[FeedItem]:
    if not block_words:
        return items
    output = []
    for word in block_words:
        for item in items:
            if word.lower() in item.title.lower():
                break
        else:
            output.append(item)
    return output


def modify_messages_push_level(messages: list, reminder_words: list[str]):
    for item in messages:
        payload = item["messages"][0]
        if "bark" in payload:
            if is_active(payload["title"], reminder_words):
                payload["level"] = "active"
                payload["group"] = "feed-active"


def is_active(title: str, reminder_words: list[str]) -> bool:
    for word in reminder_words:
        if word.lower() in title.lower():
            return True
    return False


def content_render(body: str) -> str:
    return html.unescape(body)


@app.command(help=help)
def main(
    url: str = typer.Argument(..., help="rss 订阅地址"),
    cachepath: Path = typer.Option("~/.FeedAlert", "--cachepath", help="持久化存储目录"),
    bark_token: str | None = typer.Option(None, "--bark-token", help="Bark 推送 API Token"),
    bark_icon: str | None = typer.Option(None, "--bark-icon"),
    bark_level: str | None = typer.Option("passive", "--bark-level", help="'active', 'timeSensitive', or 'passive', or 'critical'"),
    bark_group: str | None = typer.Option("Default", "--bark-group"),
    verbose: bool = typer.Option(True, help="详细输出"),
    block_words: list[str] | None = typer.Option(None, help="屏蔽关键词, 跳过匹配的标题"),
    reminder_words: list[str] | None = typer.Option(None, help="提醒关键词, 匹配的通知以 active 级别发送"),
    timecache: bool = typer.Option(False, help="对条目进行缓存时是否基于条目的 pubDate, 若 False, 则条目的 pubDate 更新时, 也会推送"),
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

    parser = FeedParser(resp.text, resp.headers.get("content-type", ""))
    feed = parser.parse()
    feed.items = filter_by_block(feed.items, block_words or [])
    for item in feed.items:
        keyname = get_cache_key(item, timecache)
        if shl[keyname]:
            continue

        if item.content:
            item.content = content_render(item.content)

        level = bark_level
        group = bark_group
        icon = feed.info.icon or bark_icon
        # https://github.com/livid/v2ex-blog-comments/discussions/8#discussioncomment-13859283
        if icon and icon.startswith("https:https://"):
            icon = icon.replace("https:https://", "https://")

        if is_active(item.title, reminder_words or []):
            level = "active"
            group = "feed-active"
        payload = make_push_messages(item, bark_token, icon, level, group)

        if verbose:
            echo(f"[Push Payload]: {payload}")

        url = "https://p.19940731.xyz/api/notifications/push/v3"
        resp = httpx.post(url, json=payload, headers={"content-type": "application/json"})
        if resp.is_error:
            echo(f"push error: {resp.text}")
            raise typer.Exit(2)
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
