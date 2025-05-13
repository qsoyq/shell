#!/usr/bin/env python3
from datetime import datetime
import typer
import rich
import rich.errors
import shelve
from pathlib import Path
import httpx
from pydantic import BaseModel, Field

app = typer.Typer()


class PublicDishesUserSchema(BaseModel):
    server_id: int
    name: str
    country: str
    avatar: str | None


class PublicDishesItemSchema(BaseModel):
    server_id: int
    name: str
    updated_at: int = Field(..., description="millisecond timestamp")
    copy_count: int
    comment_count: int
    like_count: int
    is_like: bool
    user: PublicDishesUserSchema
    is_copied: bool
    image_url: str


class PublicDishesResSchema(BaseModel):
    success: bool
    page: int
    limit: int
    total_page: int
    items: list[PublicDishesItemSchema]


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


@app.command()
def main(cachepath: Path = typer.Option("~/.homechef", "--cachepath", help="持久化存储目录"), verbose: bool = typer.Option(True, help="详细输出")):
    cachepath = cachepath.expanduser()
    if cachepath.is_dir():
        echo(f"{cachepath} must not be folder")
        raise typer.Exit(-2)
    shl = ShelveStorage(cachepath)
    bark_token = shl["bark_token"]
    if not bark_token:
        echo("bark_token must exists. please execute update-env to save.")
        raise typer.Exit(-3)
    url = "https://www.homechefapp.com/api/v1/public_dishes?lang=zh_cn&page=1&q&q_ingredient"
    resp = httpx.get(url, verify=False)
    resp.raise_for_status()
    dishes = PublicDishesResSchema(**resp.json())
    dishes = [dish for dish in dishes.items if not shl[f"dishes-items-{dish.server_id}"]]
    if verbose:
        echo(f"fetch new dish count: {len(dishes)}")
    messages = []
    for dish in dishes:
        if verbose:
            echo(f"{dish.user.name}\t{dish.user.avatar}\t{dish.name}\t{dish.image_url}")
        updateed_at = datetime.fromtimestamp(dish.updated_at / 1000).strftime("%Y-%m-%d %H:%M:%S")
        message = {
            "bark": {
                "device_key": bark_token,
                "title": f"{dish.name}",
                "icon": dish.image_url,
                "body": f"{dish.user.name}\nlike_count: {dish.like_count}\n{updateed_at}",
                "group": "homechef",
                "level": "passive",
            }
        }
        messages.append(message)
    url = "https://p.19940731.xyz/api/notifications/push/v3"
    payload = {"messages": messages}
    resp = httpx.post(url, json=payload, verify=False, timeout=60)
    resp.raise_for_status()
    for dish in dishes:
        shl[f"dishes-items-{dish.server_id}"] = dish.model_dump_json()


@app.command()
def update_env(
    cachepath: Path = typer.Option("~/.homechef", "--cachepath", help="持久化存储目录"), bark_token: str = typer.Option(None, "--bark-token", prompt="输入 Bark Token", help="Bark 推送 API Token")
):
    cachepath = cachepath.expanduser()
    if cachepath.is_dir():
        echo(f"{cachepath} must not be folder")
        raise typer.Exit(-2)
    shl = ShelveStorage(cachepath)
    if bark_token:
        shl["bark_token"] = bark_token
        echo("更新 bark_token 成功")


@app.command()
def env(cachepath: Path = typer.Option("~/.homechef", "--cachepath", help="持久化存储目录")):
    cachepath = cachepath.expanduser()
    if cachepath.is_dir():
        echo(f"{cachepath} must not be folder")
        raise typer.Exit(-2)
    shl = ShelveStorage(cachepath)
    envs = ["bark_token"]
    for env in envs:
        echo(f"{env}: {shl[env]}")


@app.callback()
def callback():
    """
    私厨 App 分享菜肴订阅。
    """


if __name__ == "__main__":
    app()
