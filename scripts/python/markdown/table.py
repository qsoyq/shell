#!/usr/bin/env python3
import sys
import typer

app = typer.Typer()


@app.command()
def sort(tablefmt: str = typer.Option("tablefmt")):
    """表格排序"""
    data = sys.stdin.read()
    if not data:
        raise typer.Exit(-1)
    # print(tabulate(table, headers, tablefmt="github"))


if __name__ == "__main__":
    app()
