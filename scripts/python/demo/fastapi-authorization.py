import logging


import typer
import uvicorn

from fastapi import FastAPI, Header


cmd = typer.Typer()
app = FastAPI()


@app.get("/ping")
async def ping(auth: str = Header(..., alias="Authorization")):
    return "ok"


@app.get("/pong")
async def pong(auth: str = Header(..., alias="Buthorization")):
    return "ok"


@cmd.command()
def http(
    host: str = typer.Option("0.0.0.0", "--host", "-h", envvar="http_host"),
    port: int = typer.Option(8000, "--port", "-p", envvar="http_port"),
    reload: bool = typer.Option(False, "--debug", envvar="http_reload"),
    log_level: int = typer.Option(logging.DEBUG, "--log_level", envvar="log_level"),
):
    """启动 http 服务"""
    logging.basicConfig(level=log_level)

    logging.info(f"http server listening on {host}:{port}")
    uvicorn.run(app, host=host, port=port, reload=reload)


if __name__ == "__main__":
    cmd()
