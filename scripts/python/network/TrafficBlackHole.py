import time
import asyncio
from io import BytesIO
from datetime import datetime

import typer
import rich.errors

app = typer.Typer()

TIMEOUT: float = 0

version = "0.1.0"

help = f"""
流量黑洞，只进不出

配合 DNS 拦截, 将拦截的域名指向本地址, 阻塞请求并挂起直到客户端主动断开或服务端超时后断开, 避免因客户端请求频繁重试而导致的连接风暴.

需要注意, 部分会阻塞客户端 UI 线程渲染的请求, 不应该被解析到本地址.

默认服务端超时时间: 600s.

Version: {version}
"""


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


async def handle_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    # TODO: 添加流量嗅探功能，提取域名/SNI, 对应白名单直接返回
    global TIMEOUT
    addr = writer.get_extra_info("peername")
    echo(f"Connected to {addr}")
    end = time.time() + TIMEOUT
    while True:
        t = end - time.time()
        if t <= 0:
            echo(f"{addr} lost connection because of timeout")
            break

        try:
            r = await asyncio.wait_for(reader.read(1), t)
        except asyncio.TimeoutError:
            echo(f"{addr} lost connection because of timeout")
            break
        if not r:
            echo(f"{addr} lost connection because of client close")
            break

    writer.close()
    await writer.wait_closed()
    echo(f"remote {addr} closed")


async def run(addr: str, port: int):
    server = await asyncio.start_server(handle_client, addr, port)
    addr = server.sockets[0].getsockname()
    echo(f"Serving on {addr}")

    async with server:
        await server.serve_forever()


@app.command(help=help)
def main(addr: str = typer.Option("0.0.0.0", "--addr"), port: int = typer.Option(8000, "--port"), timeout: float = typer.Option(600, "--timeout", help="默认阻塞时间, 到期后断开连接")):
    global TIMEOUT
    TIMEOUT = timeout
    asyncio.run(run(addr, port))


if __name__ == "__main__":
    app()
