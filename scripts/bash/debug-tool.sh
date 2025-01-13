#!/usr/bin/env bash
pip install --upgrade certifi   --trusted-host pypi.org --trusted-host files.pythonhosted.org
pip install httpx bs4 typer rich tabulate socksio ipython pysocks ipython pyvim ruff you-get vcron --trusted-host pypi.org --trusted-host files.pythonhosted.org

curl -sL -o /usr/local/bin/mikanani-magnet "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/mikanani/filter.py?v=$(date +%s)"
curl -sL -o /usr/local/bin/replace-all "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/terminal/replace-all.py?v=$(date +%s)"
curl -sL -o /usr/local/bin/MarkdownInlineImageLinkMigrator "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/markdown/MarkdownInlineImageLinkMigrator.py?v=$(date +%s)"
curl -sL -o /usr/local/bin/gmail "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/tool/gmail.py?v=$(date +%s)"
curl -sL -o /usr/local/bin/tastien "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/crontab/tastien.py?v=$(date +%s)"
curl -sL -o /usr/local/bin/waitfor "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/tool/waitfor.py?v=$(date +%s)"
curl -sL -o /usr/local/bin/pytar "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/tool/ptar.py?v=$(date +%s)"
curl -sL -o /usr/local/bin/duplicate "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/tool/duplicate.py?v=$(date +%s)"
curl -sL -o /usr/local/bin/markdown-table "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/markdown/table.py?v=$(date +%s)"
curl -sL -o /usr/local/bin/clear-docker-log "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/tool/clear-docker-log.py?v=$(date +%s)"
curl -sL -o /usr/local/bin/url-watcher "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/tool/url-watcher.py?v=$(date +%s)"
curl -sL -o /usr/local/bin/dump-clash-connections "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/clash/dump_connections.py?v=$(date +%s)"
curl -sL -o /usr/local/bin/pudp "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/network/udp.py?v=$(date +%s)"

chmod +x /usr/local/bin/*

# alias
alias unicode-escape='python3 -c "import sys;data=sys.stdin.read();print(data.encode(\"unicode-escape\").decode(),end=\"\")"'
alias unicode-deescape='python3 -c "import sys;data=sys.stdin.read();print(data.encode(\"utf-8\").decode(\"unicode_escape\"),end=\"\")"'
alias dump_clash_connections="curl -s https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/clash/dump_connections.py | python3"
alias dump-http-capture="curl -s https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/stash/dump-http-capture.py | python3" 
alias markdown-image-move="markdown_inline_image_link_oss_export && MarkdownInlineImageLinkMigrator -d ~/Documents/obsidian/Obsidian"
alias json-to-yaml="python3 -c \"import sys,json,yaml;data=sys.stdin.read();print(yaml.safe_dump(json.loads(data)))\""
alias yaml-to-json="python3 -c \"import sys,json,yaml;data=sys.stdin.read();print(json.dumps(yaml.safe_load(data), ensure_ascii=False, indent=4))\""
