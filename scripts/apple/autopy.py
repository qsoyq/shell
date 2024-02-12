#! /usr/bin/env python3
# cd ~/Desktop && isort autopy.py && ruff check autopy.py --fix && ruff format autopy.py
# cp ~/Desktop/autopy.py /usr/local/bin/autopy

# pip install xmltodict httpx pydantic python-dateutil
# pytest ~/Desktop/autopy.py

import html
import json
import logging
import os
import re
import subprocess
import sys
import threading
import time
from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from functools import wraps
from itertools import chain
from pathlib import Path
from subprocess import check_output
from threading import RLock

import httpx
import xmltodict
from dateutil import parser
from pydantic import BaseModel, Field

logger = logging.getLogger()


class AliasExpander:
    @staticmethod
    def zsh_alias() -> dict:
        d = {}
        alias = (
            check_output(
                "source ~/.zshrc > /dev/null && alias",
                shell=True,
                executable="/bin/zsh",
            )
            .decode()
            .strip()
        )
        for item in alias.split("\n"):
            _alias, command = item.split("=", 1)
            command = command.strip("'")
            d[_alias] = command
        return d


class Tools:
    @staticmethod
    def add_log_handler(
        filename: str,
        *,
        log_fmt: str = "%(asctime)s - %(levelname)s - %(message)s",
        log_level=logging.WARNING,
    ):
        # 创建一个文件处理器，将日志写入文件
        log_path = Path(filename).expanduser()
        if not log_path.parent.exists():
            log_path.parent.mkdir(parents=True)
        fh = logging.FileHandler(log_path)
        fh.setFormatter(logging.Formatter(log_fmt))
        fh.setLevel(log_level)
        logger = logging.getLogger()
        logger.addHandler(fh)

    @staticmethod
    def get_command_from_alias(command: str) -> str | None:
        alias = AliasExpander.zsh_alias()
        return alias.get(command, None)

    @staticmethod
    def escape_translate(s: str) -> str:
        index = 0
        res = ""
        tables = {"\\'": "'", "\\\\": "\\"}
        while index < len(s):
            char = s[index]
            if char == "\\":
                if s[index : index + 2] in tables:
                    res += tables[s[index : index + 2]]
                    index += 2
                    continue
            else:
                res += char
                index += 1
        return res

    @staticmethod
    def get_localip() -> str:
        return check_output("ipconfig getifaddr en0", shell=True).decode().strip()

    @staticmethod
    def remove_html_tags(text: str):
        # 定义一个正则表达式，用于匹配HTML标签
        html_tags_re = re.compile(r"<[^>]+>")
        # 使用sub方法替换掉所有HTML标签为空字符串
        return html_tags_re.sub("", text)

    @staticmethod
    def get_bark_token(key: str = "BARK_TOKEN"):
        return os.getenv(key)

    @staticmethod
    def get_mikanani_rss_url():
        return os.getenv("mikanani_rss_url")

    @staticmethod
    def noexception(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.warning(f"noexception: {e}", exc_info=True)
                pass

        return wrapper

    @staticmethod
    def thread_error_handler(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.error(f"thread_error_handler: {e}", exc_info=True)
                token = Tools.get_bark_token()
                if token is not None:
                    cb = Tools.noexception(BarkAPI(token).push)
                    cb(
                        BarkPushScheme(
                            title=f"thread_error_handler - {datetime.now()}",
                            body=f"{e}",
                            group="errors",
                            isArchive="1",
                            level=BarkPushLevel.timeSensitive,
                        )  # type: ignore
                    )
                raise e

        return wrapper


class BarkPushLevel(str, Enum):
    active = "active"
    timeSensitive = "timeSensitive"
    passive = "passive"


class BarkGroup(str, Enum):
    macbookpro = "MacbookPro"
    bilibili = "Bilibili"
    bilibili_live = "BilibiliLive"
    mikanani = "Mikanani"


class BarkPushScheme(BaseModel):
    """
    level
        active:默认值,系统会立即亮屏显示通知。

        timeSensitive:时效性通知,可在专注状态下显示通知。

        passive: 仅将通知添加到通知列表,不会亮屏提醒。
    """

    title: str
    body: str
    category: str | None = Field(None, help="Reserved field, no use yet")
    device_key: str | None = Field(None, help="bark token, The key for each device")
    level: BarkPushLevel | None = Field(
        None, help="'active', 'timeSensitive', or 'passive'"
    )
    badge: int | None = Field(
        None,
        help="The number displayed next to App icon ([Apple Developer](https://developer.apple.com/documentation/usernotifications/unnotificationcontent/1649864-badge))",
    )
    automaticallyCopy: str | None = Field(None, help="Must be 1")
    _copy: str | None = Field(None, help="The value to be copied", alias="copy")
    sound: str | None = Field(
        None, help="Value from [here](https://github.com/Finb/Bark/tree/master/Sounds)"
    )
    icon: str | None = Field(
        None, help="An url to the icon, available only on iOS 15 or later"
    )
    group: str | None = Field(None, help="The group of the notification")
    isArchive: str | None = Field(
        None, help="Value must be 1. Whether or not should be archived by the app"
    )
    url: str | None = Field(None, help="Url that will jump when click notification")


class BilibiliRoomInfoScheme(BaseModel):
    uid: int
    room_id: int
    title: str | None
    description: str | None
    live_status: int | None
    live_time: str | None
    user_cover: str | None
    keyframe: str | None
    live_time: str | None

    def get_room_link(self):
        return f"https://live.bilibili.com/{self.room_id}"

    @property
    def pub_date(self) -> datetime:
        assert self.live_time
        return parser.parse(self.live_time)

    def is_alive(self):
        return self.live_status == 1

    def if_push(self, last_pub_date: datetime | int | str | None) -> bool:
        if last_pub_date is None:
            return True

        if isinstance(last_pub_date, str):
            last_pub_date = parser.parse(last_pub_date)

        if isinstance(last_pub_date, int):
            return int(self.pub_date.timestamp()) > last_pub_date

        if isinstance(last_pub_date, datetime):
            return int(self.pub_date.timestamp()) > int(last_pub_date.timestamp())

        return False

    def get_bark_push_message(self) -> BarkPushScheme:
        link = self.get_room_link()
        return BarkPushScheme(
            title=RSSHubWatcher.clean_text(self.title or ""),
            body=RSSHubWatcher.clean_text(self.description or ""),
            url=link,
            icon=self.keyframe,
            group=BarkGroup.bilibili_live,
            isArchive="1",
            _copy=link,  # type: ignore
        )  # type: ignore


class BilibiliAnchorInRoomScheme(BaseModel):
    uid: int
    uname: str
    face: str | None


class BarkAPI:
    def __init__(self, token: str) -> None:
        self.token = token

    def push(self, body: BarkPushScheme) -> httpx.Response:
        """https://github.com/Finb/bark-server/blob/master/docs/API_V2.md#push"""
        url = "https://api.day.app/push"
        if not body.device_key:
            body.device_key = self.token

        # {"code":500,"message":"interface conversion: interface {} is nil, not string","timestamp":1706443398}%
        # 兼容对参数位null的处理
        paylaod = {k: v for k, v in body.dict().items() if v is not None}

        res = httpx.post(url, json=paylaod)
        logger.debug(f"bark push body: {body.dict()}")
        res.raise_for_status()
        return res


class LocalStorage:
    LOCK = RLock()

    def __init__(self, path="~/.autopy.json"):
        self._path = Path(path).expanduser()
        if not self._path.exists():
            if not self._path.parent.exists():
                self._path.parent.mkdir(parents=True)
            self._path.touch()

    def get(self, key: str, default=None):
        with self.__class__.LOCK:
            data = self._load()
            return data.get(key, default)

    def _load(self) -> dict:
        with self._path.open("r") as f:
            try:
                data = json.load(f)
                return data
            except json.decoder.JSONDecodeError:
                return {}

    def put(self, key: str, value):
        with self.__class__.LOCK:
            data = self._load()
            data[key] = value
            with self._path.open("w") as f:
                json.dump(data, f, indent=4)


class IntervalThread(threading.Thread):
    def __init__(self, *args, interval=60, context: dict | None = None, **kwargs):
        super().__init__(*args, **kwargs)
        self.interval = interval
        self.context = context or {}

    @Tools.thread_error_handler
    def run(self):
        while True:
            self.handler()
            time.sleep(self.interval)

    @abstractmethod
    def handler(self):
        pass


class MacbookProInfo(IntervalThread):
    def __init__(self, *args, bark_token: str | None = None, **kwargs):
        super().__init__(*args, **kwargs)
        self.set_path()
        self.bark_token = bark_token

    def set_path(self):
        self.log_path = p = Path("~/Desktop/log.txt").expanduser()
        if not p.exists():
            p.touch()

    @Tools.noexception
    def handler(self):
        self.write_log()
        self.push()

    def write_log(self):
        self.log_path.write_text(f"\n{datetime.now()}")

    def push(self):
        if self.bark_token is None:
            return
        localip = Tools.get_localip()
        contents = [
            f"时间: {datetime.now()}",
            f"IP: {localip}",
            f"电量: {BatteryPowerNotifier.get_battery_power_percent()}",
        ]
        payload = BarkPushScheme(
            title=f"{self.__class__.__name__}",
            body="\n".join(contents),
            level=BarkPushLevel.passive,
            group=BarkGroup.macbookpro,
            icon="https://telegraph.19940731.xyz/file/a9936c159b2b9cc87b3d5.png",
        )  # type: ignore
        BarkAPI(self.bark_token).push(payload)


class CommandRunner(IntervalThread):
    def handler(self):
        commands = self.context.get("commands", [])
        for command in commands:
            self.run_command(command)

    @Tools.noexception
    def run_command(self, command: str):
        executable = self.context.get("executable")
        alias_command = Tools.get_command_from_alias(command)
        if alias_command:
            command = alias_command
        command = Tools.escape_translate(command)
        # p = subprocess.run(command, text=True, capture_output=True, shell=True,check=True, executable=executable)
        # if p.returncode != 0:
        # logger.info(f"run command failed: {p.stderr}")
        # return

        check_output(command, shell=True, executable=executable)
        logger.info(f"run command: [{command}] at {datetime.now()}")


class BatteryPowerNotifier(threading.Thread):
    """When the laptop battery is less than a specified value, send a notification (exit thread after successful sending).
    >>> bark_token = ""
    >>> min_power = 20
    >>> BatteryPowerNotifier(bark_token, min_power=min_power, name="BatteryPowerNotifier20").start().join()
    """

    def __init__(
        self, bark_token: str, interval: int = 60, min_power: int = 20, **kwargs
    ):
        kwargs.setdefault("name", "BatteryPowerNotifier")
        super().__init__(**kwargs)
        self.interval = interval
        self.min_power = min_power
        self.bark_token = bark_token

    def _bark_notification(self, percent: int):
        BarkAPI(self.bark_token).push(
            BarkPushScheme(
                title="macbookpro 电量不足",
                body=f"当前电量: {percent}%",
                group=BarkGroup.macbookpro,
                level=BarkPushLevel.passive,
                isArchive="1",
            )  # type: ignore
        )

    @Tools.thread_error_handler
    def run(self) -> None:
        while True:
            logger.info(
                f"{self.__class__.__name__} date {datetime.fromtimestamp(int(time.time()))}"
            )
            percent = BatteryPowerNotifier.get_battery_power_percent()
            if percent is not None:
                if percent <= self.min_power:
                    self._bark_notification(percent)
                    return
            time.sleep(self.interval)

    @staticmethod
    def get_battery_power_percent() -> int | None:
        if sys.platform == "darwin":
            return BatteryPowerNotifier.get_battery_power_percent_macos()

        return None

    @staticmethod
    def get_battery_power_percent_macos() -> int:
        cmd = "pmset -g batt | grep -o '[0-9]*%' | tr -d '%'"
        power = subprocess.check_output(cmd, shell=True)
        return int(power)


class RSSHubWatcher(ABC, threading.Thread):
    """https://docs.rsshub.app/zh/"""

    def __init__(
        self, bark_token: str, context: dict | None = None, interval: int = 60, **kwargs
    ):
        super().__init__(**kwargs)
        self.interval = interval
        self.context = context or {}
        self.bark_token = bark_token
        self.failed_messages: list[str | BarkPushScheme] = []

    @staticmethod
    def clean_text(text: str) -> str:
        return Tools.remove_html_tags(html.unescape(text.replace("<br>", "\n")))

    @Tools.thread_error_handler
    def run(self) -> None:
        while True:
            logger.info(
                f"RSSHubWatcher {self.__class__.__name__} date {datetime.now()}"
            )
            self.parse_rss()
            time.sleep(self.interval)

    @Tools.noexception
    def parse_rss(self):
        messages = self.handler()
        self._bark_notification(messages)
        self.ts = int(time.time())

    def _bark_notification(self, messages: list[str | BarkPushScheme]):
        failed_messages = self.failed_messages.copy()
        self.failed_messages.clear()
        for message in chain(failed_messages, messages):
            if isinstance(message, BarkPushScheme):
                body = message
            else:
                raise ValueError(f"message type error: {type(message)}")
            try:
                res = BarkAPI(self.bark_token).push(body)
                res.raise_for_status()
            except Exception as e:
                logger.warning(
                    f"{self.__class__.__name__} bark notification failed: {e}"
                )
                self.failed_messages.append(message)

    @abstractmethod
    def handler(self) -> list[str | BarkPushScheme]:
        raise NotImplementedError


class RSSHubBilibiliLiveRoomWatcher(RSSHubWatcher):
    """Subscribe to the Bilibili live room broadcast status, and send out a notification when it starts broadcasting.
    https://docs.rsshub.app/zh/routes/live#bi-li-bi-li-zhi-bo-zhi-bo-kai-bo
    >>> bark_token = ""
    >>> RSSHubBilibiliLiveRoomWatcher(bark_token, name="RSSHubBilibiliLiveRoomWatcher").start().join()
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_datetime = datetime.now()

    def get_room_info(self, room_id: str | int) -> BilibiliRoomInfoScheme:
        url = "https://api.live.bilibili.com/room/v1/Room/get_info"
        headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        }
        params = {"room_id": room_id, "from": "room"}
        resp = httpx.get(url, params=params, headers=headers)
        resp.raise_for_status()
        return BilibiliRoomInfoScheme(**resp.json().get("data", {}))

    def get_anchor_in_room(self, room_id: int | str) -> BilibiliAnchorInRoomScheme:
        "https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room?roomid="
        url = "https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room"
        headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Referer": f"https://live.bilibili.com/{room_id}",
        }
        parmas = {"roomid": room_id}
        resp = httpx.get(url, params=parmas, headers=headers)
        resp.raise_for_status()
        return BilibiliAnchorInRoomScheme(**resp.json()["data"]["info"])

    @property
    def rooms(self) -> list[str]:
        _local = LocalStorage().get(self.__class__.__name__, {})
        return list(map(str, _local.keys()))

    def handler(self) -> list[str | BarkPushScheme]:
        res = []
        for roomid in self.rooms:
            messages = self.handle_one(roomid)
            res.extend(messages)
        return res

    def handle_one(self, roomid: int | str) -> list[str | BarkPushScheme]:
        if isinstance(roomid, int):
            roomid = str(roomid)

        info = self.get_room_info(roomid)
        user = self.get_anchor_in_room(roomid)
        _local = LocalStorage().get(self.__class__.__name__, {})
        last_pub_date = parser.parse(_local.get(roomid, str(self.start_datetime)))

        logger.debug(f"RSSHubBilibiliLiveRoomWatcher room info: {info}")
        if info.is_alive() and info.if_push(last_pub_date):
            message = info.get_bark_push_message()
            message.title = f"{user.uname} - {message.title}"
            message.icon = user.face
            _local[roomid] = str(info.pub_date)
            LocalStorage().put(self.__class__.__name__, _local)
            return [message]
        return []


class MikananiRssWatcher(threading.Thread):
    """Send a notification when the anime subscribed to by Mikanani Project is updated.
    https://mikanani.me/
    >>> bark_token = ""
    >>> rss_url = "https://mikanani.me/RSS/MyBangumi?token={token}"
    >>> MikananiRssWatcher(bark_token, rss_url, name="MikananiRssWatcher").start().join()
    """

    def __init__(self, bark_token: str, rss_url: str, interval: int = 60, **kwargs):
        super().__init__(**kwargs)
        _local = LocalStorage().get(self.__class__.__name__, {})
        self.start_datetime = parser.parse(
            _local.get("start_datetime", str(datetime.now()))
        )
        self.interval = interval
        self.rss_url = rss_url
        self.bark_token = bark_token
        self.failed_messages = []

    @Tools.thread_error_handler
    def run(self) -> None:
        while True:
            logger.info(f"{self.__class__.__name__} date {self.start_datetime}")
            messages = self.parse_rss()
            self._bark_notification(messages)
            time.sleep(self.interval)

    @Tools.noexception
    def _bark_notification(self, messages: list[BarkPushScheme] | None):
        if messages is None:
            messages = []
        failed_messages = self.failed_messages.copy()
        self.failed_messages.clear()
        for message in chain(failed_messages, messages):
            try:
                if isinstance(message, BarkPushScheme):
                    payload = message
                else:
                    raise ValueError(f"message type error: {type(message)}")
                BarkAPI(self.bark_token).push(payload)
            except Exception as e:
                logger.warning(f"MikananiRssWatcher bark notification failed: {e}")
                self.failed_messages.append(message)

    @Tools.noexception
    def parse_rss_date(self, pubDate: str) -> int:
        return int(parser.parse(pubDate).timestamp())

    @Tools.noexception
    def parse_rss(self) -> list[BarkPushScheme]:
        messages = []
        res = httpx.get(self.rss_url)
        res.raise_for_status()
        data = xmltodict.parse(res.text)
        for item in data["rss"]["channel"]["item"]:
            torrent = item["torrent"]
            title = item["title"]
            content = item["title"]
            pubDate = parser.parse(torrent["pubDate"])
            link = torrent["link"]
            torrent_download_url = item["enclosure"]["@url"]
            if int(pubDate.timestamp()) >= int(self.start_datetime.timestamp()):
                message = BarkPushScheme(
                    title=title,
                    body=content,
                    url=link,
                    copy=torrent_download_url,
                    group=BarkGroup.mikanani,
                    level=BarkPushLevel.passive,
                    isArchive="1",
                    icon="https://telegraph.19940731.xyz/file/f96f84e731773f78125d7.jpg",
                )  # type: ignore
                messages.append(message)

        if messages:
            self.start_datetime = datetime.now()
            _local = LocalStorage().get(self.__class__.__name__, {})
            _local["start_datetime"] = str(self.start_datetime)
            LocalStorage().put(self.__class__.__name__, _local)

        return messages
