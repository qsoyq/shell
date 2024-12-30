#!/usr/bin/env python3
import sys
from pprint import pprint
from rich import print
from datetime import datetime
import typer
import textwrap
from tabulate import tabulate
from collections import defaultdict

app = typer.Typer()


def echo(*args, **kwargs):
    if args:
        arg = f"[{get_current_datetime_str()}] {args[0]}"
        args = [arg, *args[1:]]
    print(*args, **kwargs)


def get_current_datetime_str() -> str:
    return datetime.now().strftime(r"%Y-%m-%d %H:%M:%S")


@app.command()
def sort():
    # data = sys.stdin.read()
    data = textwrap.dedent(
        """
    | 机场  | 费用(元) | 总量(G) | 单价(G/每元)  |
    | ----- | -------- | ------- | ----- |
    | mojie | 14.9     | 130     | 8.72  |
    | mojie | 42       | 420     | 10    |
    | mojie | 1        | 2       | 2     |
    | mojie | 69       | 750     | 10.86 |
    | mojie | 138      | 1,660   | 12.02 |
    | mojie | 279      | 3,600   | 12.9  |
    | mojie | 688      | 10,000  | 14.53 |
    | xfltd | 10       | 120     | 12    |
    | xfltd | 20       | 250     | 12.5  |
    | xfltd | 30       | 390     | 13      |
    """
    )
    content = [x for x in data.split("\n") if x]
    if not content:
        return
    cnt = content[0].count("|")
    for line in content:
        assert line.count("|") == cnt, line
    headers = [] if not content else content[0].split("|")
    headers = [x.strip() for x in headers if x.strip()]
    body = content[2:]
    body = [[y.strip() for y in x.split("|") if y.strip()] for x in body]

    mapping = defaultdict(list)
    for line in body:
        for k, v in zip(headers, line):
            mapping[k].append(v)
    # pprint(mapping)
    # pprint(headers)
    # pprint(body)
    # print(tabulate(body, headers, tablefmt="github"))
    print(tabulate(mapping, headers, tablefmt="github"))
    pass


if __name__ == "__main__":
    app()
