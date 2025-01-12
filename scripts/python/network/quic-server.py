#!/usr/bin/env python3

import rich
import asyncio
from hypercorn.config import Config
from hypercorn.asyncio import serve
from pathlib import Path
from datetime import datetime
import typer
from fastapi import FastAPI, Request

api = FastAPI()
app = typer.Typer()


@api.get("/")
async def read_root(request: Request):
    http_version = request.scope["http_version"]
    return {"http_version": http_version}


def echo(*args, **kwargs):
    if args:
        arg = f"[{get_current_datetime_str()}] {args[0]}"
        args = [arg, *args[1:]]
    rich.print(*args, **kwargs)


def get_current_datetime_str() -> str:
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


@app.command()
def main(
    cert: Path = typer.Option(..., "-c", "--cert", help=" SSL证书文件路径"),
    key: Path = typer.Option(..., "-k", "--key", help="SSL密钥文件路径"),
    port: int = typer.Option(8000, "-p", "--port", help="监听端口号"),
):
    config = Config()
    config.certfile = str(cert.absolute())
    config.keyfile = str(key.absolute())
    bind = f"0.0.0.0:{port}"
    config.bind = bind
    config.quic_bind = bind
    asyncio.run(serve(api, config))  # type: ignore


if __name__ == "__main__":
    app()
