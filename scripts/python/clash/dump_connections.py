#!/usr/bin/env python3
import time
import httpx
import json
from pathlib import Path
import os

url = os.getenv("url", "http://127.0.0.1:9090/connections")
output = "./connections.json"

if __name__ == "__main__":
    result = set()
    path = Path(output)
    while True:
        res = httpx.get(url)
        data = res.json()
        connections = data.get("connections", [])
        for connection in connections:
            metadata = connection.get("metadata", {})
            destinationIP = metadata.get("destinationIP")
            destinationPort = metadata.get("destinationPort")
            network = metadata.get("network")
            inbound = metadata.get("inbound")
            chain = ",".join(metadata.get("chain", []))
            ruleType = metadata.get("ruleType")

            host = metadata.get("host")
            result.add(
                (
                    network,
                    inbound,
                    host,
                    destinationIP,
                    destinationPort,
                    ruleType,
                    chain,
                )
            )

        with path.open("w") as f:
            out = [list(x) for x in result]
            f.write(json.dumps({"connections": out}, ensure_ascii=False, indent=4))
        time.sleep(1)
