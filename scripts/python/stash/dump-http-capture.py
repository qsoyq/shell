import json
from pathlib import Path


path = Path("~/Downloads/http-catpure.log").expanduser()
failed = successed = 0
with path.open("r") as f:
    lines = filter(lambda x: x and "JSON" in x, f.readlines())

lines = map(lambda x: x[18:], lines)
data = [json.loads(x) for x in lines]
print(json.dumps(data, indent=4, ensure_ascii=False))
