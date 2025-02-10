#!/usr/bin/env python3
import socket
import rich
from datetime import datetime
import typer


app = typer.Typer()


def echo(*args, **kwargs):
    if args:
        arg = f"[{get_current_datetime_str()}] {args[0]}"
        args = [arg, *args[1:]]
    rich.print(*args, **kwargs)


def get_current_datetime_str() -> str:
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


@app.command()
def client(
    message: str = typer.Argument("hello world", help="发送的消息"),
    host: str = typer.Option("127.0.0.1", "-h", "--host", help="服务端地址"),
    port: int = typer.Option(8000, "-p", "--port", help="服务端端口"),
    timeout: float = typer.Option(60, "-t", "--timeout", help="超时时间"),
):
    "创建客户端，发送消息并监听回复"
    # 创建 UDP 套接字
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    if timeout:
        client_socket.settimeout(timeout)
    try:
        # 发送数据
        echo(f"发送到 {host}:{port}: {message}")
        client_socket.sendto(message.encode(), (host, port))

        # 接收回显数据
        data, addr = client_socket.recvfrom(1024)  # 缓冲区大小为 1024 字节
        echo(f"接收到来自 {addr} 的回显: {data.decode()}")
    except socket.timeout:
        echo("接收响应超时")
    finally:
        client_socket.close()


@app.command()
def echo_server(
    host: str = typer.Option("0.0.0.0", "-h", "--host", help="监听地址"),
    port: int = typer.Option(8000, "-p", "--port", help="监听端口"),
):
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    server_socket.bind((host, port))
    print(f"UDP Echo Server 启动，监听 {host}:{port}")

    while True:
        data, addr = server_socket.recvfrom(1024)
        echo(f"接收到来自 {addr} 的数据: {data.decode()}")
        server_socket.sendto(data, addr)


if __name__ == "__main__":
    app()
