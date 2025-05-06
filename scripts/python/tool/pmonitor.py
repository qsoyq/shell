#!/usr/bin/env python3
import os
from datetime import datetime
import typer
import rich
import rich.errors
import psutil
import time

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
def main(
    name: str = typer.Option(..., "--name", help="监听的进程名称"),
    verbose: bool = typer.Option(False, "-v", "--verbose", help="显示详细输出"),
    cb: str = typer.Option(..., "-c", "--callback", help="进程启动命令"),
    forever: bool = typer.Option(True, "--forever", help="是否持续监听"),
    start_delay: float = typer.Option(10, "--start-delay", help="脚本启动等待时间"),
):
    """监听进程并在进程退出后执行命令"""
    if start_delay:
        echo(f"[Process] waitfor {start_delay}s")
        time.sleep(start_delay)

    while True:
        proc = None
        for p in psutil.process_iter(["pid", "name"]):
            try:
                if verbose:
                    echo(f"[Process] {p.pid}, {p.name()}")

                if p.name() == name:
                    proc = p
                    echo(f"[Process] find target proc: {proc}")
                    if not verbose:
                        break
            except (psutil.AccessDenied, psutil.NoSuchProcess, psutil.ZombieProcess) as e:
                if verbose:
                    echo(f"[Process] Could not access info for PID {p.pid} (maybe terminated or permission denied), exception: {e}")
                continue

        if proc:
            echo(f"[Process] wait for terminate, process: {proc}")
            proc.wait()
            proc = None

        if not proc:
            time.sleep(0.5)
            exitcode = os.system(cb)
            if exitcode != 0:
                echo(f"[Process] execute {cb} failed, exitcode: {exitcode}")
                if not forever:
                    raise typer.Exit(-1)
            else:
                echo(f"[Process] execute {cb} successed")
        if not forever:
            break


if __name__ == "__main__":
    app()
