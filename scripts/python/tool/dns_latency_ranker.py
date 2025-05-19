#!/usr/bin/env python3
from datetime import datetime
from dataclasses import dataclass
import typer
import rich
import rich.errors
import httpx
import dns.resolver
from pythonping import ping, executor


@dataclass
class GEOData:
    isp: str | None
    region: str | None
    country_code: str | None

    def __repr__(self):
        return f"{self.isp} - {self.region}"


@dataclass
class IP:
    ip: str
    geodata: GEOData
    ping_response_list: executor.ResponseList


def get_geoip(ip: str) -> GEOData:
    ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/605.1.15"
    url = f"https://api.ip.sb/geoip/{ip}"
    resp = httpx.get(url, headers={"User-Agent": ua})
    resp.raise_for_status()
    data = resp.json()
    return GEOData(isp=data.get("isp"), region=data.get("region"), country_code=data.get("country_code"))


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
def main(domain: str = typer.Option("updates.cdn-apple.com.download.ks-cdn.com", "--domain", "-d"), nameservers: list[str] = typer.Option(["223.5.5.5", "223.6.6.6"], "--nameservers")):
    ips = []
    resolver = dns.resolver.Resolver()
    resolver.nameservers = nameservers
    answers_a = resolver.resolve(domain, "A")
    for rdata in answers_a:
        ips.append(rdata.address)  # type: ignore

    results: list[IP] = []
    for ip in set(ips):
        res: executor.ResponseList = ping(ip)
        geo = get_geoip(ip)
        results.append(IP(ip=ip, geodata=geo, ping_response_list=res))

    results.sort(key=lambda x: x.ping_response_list.rtt_avg)
    print(f"{domain} - {nameservers}")
    print("ip - isp - region - rtt_min - rtt_avg - rtt_max - packets_lost")
    for item in results:
        print(
            f"{item.ip} - {item.geodata} - {item.ping_response_list.rtt_min * 1000:.3f} - {item.ping_response_list.rtt_avg * 1000:.3f} - {item.ping_response_list.rtt_max * 1000:.3f} - {item.ping_response_list.packets_lost}"
        )


if __name__ == "__main__":
    app()
