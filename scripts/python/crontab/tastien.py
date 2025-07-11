#!/usr/bin/env python3
import time
import rich

from datetime import datetime
import typer
import httpx
import uuid

app = typer.Typer()


def echo(*args, **kwargs):
    if args:
        arg = f"[{get_current_datetime_str()}] {args[0]}"
        args = [arg, *args[1:]]
    rich.print(*args, **kwargs)


def get_current_datetime_str():
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


@app.command()
def sign():
    """签到"""
    pass


@app.command()
def point_create(
    userToken: str = typer.Option(..., "-u", "--userToken", help="替换前的字符串", envvar="userToken"),
    activityId: str = typer.Option(..., "-a", "--activityId", help="替换后的字符串", envvar="activityId"),
    max_try: int = typer.Option(15, "--max-try", help="最大尝试次数"),
    webhook: str = typer.Option(None, "-w", "--webhook", help="请求成功后回调的 URL"),
    until: datetime = typer.Option(None, "-d", "--datetime", help="在该时间点后继续执行"),
):
    """
    塔斯汀积分兑换
    """
    current = datetime.now()
    if until is not None:
        if current > until:
            echo("[Datetime] 日期已过期, 退出")
            raise typer.Exit(-1)

        delta = until - current
        wait = delta.seconds + delta.microseconds / 1_000_000
        echo(f"[Datetime] 等待 {wait} s后执行")
        time.sleep(wait)

    echo(" Start")
    url = "https://sss-web.tastientech.com/api/c/pointOrder/create"
    headers = {
        "User-Token": userToken,
        "Referer": "https://servicewechat.com/wx557473f23153a429/379/page-frame.html",
        "Accept-Encoding": "gzip,compress,br,deflate",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.54(0x18003622) NetType/WIFI Language/zh_CN",
        "Content-Type": "application/json",
        "Version": "3.3.0",
        "Host": "sss-web.tastientech.com",
        "Channel": "1",
        "Connection": "keep-alive",
    }
    for _ in range(max_try):
        requestId = uuid.uuid4().hex[:11]
        body = {"requestId": requestId, "activityId": activityId}
        resp = httpx.post(url, json=body, headers=headers, verify=False)
        resp.raise_for_status()
        text = resp.text
        for content in [
            "当前活动领取数量已达上限",
            "当前活动还未到开放时段",
            "请勿重复提交",
            "当前时段可领取数量已经达到上限",
            "用户限领已达上限",
            "该用户已经有锁定的记录",
            "当前活动领取数量达到总限",
        ]:
            if content in text:
                echo(f"[Break] {content}")
                raise typer.Exit(1)

        for content in ["活动太火爆了"]:
            if content in text:
                echo(f"[Continue] {content}")
                continue

        data = resp.json()
        code = data.get("code")
        if code == 200:
            echo(f"[Point] 积分兑换成功, 当前活动 ID: {activityId}")
            raise typer.Exit(0)
        else:
            echo(f"[Error] 未知错误:\n{data}")
            raise typer.Exit(2)
    else:
        echo("[Max] 尝试次数超过上线 ")


if __name__ == "__main__":
    app()
