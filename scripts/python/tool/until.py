#!/usr/bin/env python3
import time
from rich import print
from datetime import datetime
import typer

app = typer.Typer()


def get_current_datetime_str():
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


@app.command()
def main(
    until: datetime = typer.Option(
        None, "-d", "--datetime", help="在该时间点后继续执行"
    ),
):
    """
    解析参数挂起直到指定时间
    """
    current = datetime.now()
    if until is not None:
        if current > until:
            print(f"[{get_current_datetime_str()}] [Datetime] 日期已过期, 退出")
            raise typer.Exit(21)

        delta = until - current
        wait = delta.seconds + delta.microseconds / 1_000_000
        print(f"[{get_current_datetime_str()}] [Datetime] 等待 {wait} s后执行")
        time.sleep(wait)
        raise typer.Exit(0)
    raise typer.Exit(0)


if __name__ == "__main__":
    app()
