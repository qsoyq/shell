#!/usr/bin/env python3
from datetime import datetime
import typer
import rich
import rich.errors
from pythonping import ping, executor
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from tabulate import tabulate


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


@app.command()
def main(ip: list[str] = typer.Argument(..., help="待测试 ip 列表"), count: int = typer.Option(4, "-c", "--count", help="ping次数")):
    headers = ["ip", "min", "avg", "max", "loss"]
    rows = []
    with ThreadPoolExecutor() as pool:
        global ping
        ping = partial(ping, count=count)
        res_li = pool.map(ping, ip)
        for index, item in enumerate(res_li):
            _ip = ip[index]
            item: executor.ResponseList
            # 2000为丢包
            elapsed = [i.time_elapsed_ms for i in item if i.error_message is None]
            if elapsed:
                rtt_min, rtt_max = min(elapsed), max(elapsed)
                rtt_avg = sum(elapsed) / len(elapsed)
            else:
                rtt_min = rtt_avg = rtt_max = 0
            rows.append((_ip, int(rtt_min), int(rtt_avg), int(rtt_max), f"{item.packet_loss:.2f}"))
    # 目前实现中丢包视为延迟 2000, 所以仅需根据 avg 排序更直观
    rows = sorted(rows, key=lambda x: x[2])
    output = tabulate(rows, headers=headers, tablefmt="pipe")

    print(output)


if __name__ == "__main__":
    app()
