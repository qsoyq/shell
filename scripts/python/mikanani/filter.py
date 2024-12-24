#!/usr/bin/env python3
"""
https://mikanani.me/Home/Bangumi
"""
import httpx
from rich import print
import typer
from bs4 import BeautifulSoup


def main(
    bangumi_id: int = typer.Argument(
        ...,
    ),
    filter_words: str = typer.Argument(..., help="过滤字符串"),
):
    """
    从标准输入读取字符串替换后输出
    """
    url = f"https://mikanani.me/Home/Bangumi/{bangumi_id}"
    resp = httpx.get(url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "lxml")
    for item in soup.select(
        "#sk-container > div.central-container > table > tbody > tr > td"
    ):
        a = item.select_one("a")
        if a is None or filter_words not in a.text:
            continue
        link = item.select_one("a.js-magnet.magnet-link")
        if link:
            print(link.attrs["data-clipboard-text"])


if __name__ == "__main__":
    typer.run(main)
