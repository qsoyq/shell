#!/bin/bash
pip --quiet install httpx bs4 typer rich tabulate socksio
curl -s -o /usr/local/bin/mikanani-magnet "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/mikanani/filter.py?v=$(date +%s)"
curl -s -o /usr/local/bin/replace-all "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/terminal/replace-all.py?v=$(date +%s)"
curl -s -o /usr/local/bin/MarkdownInlineImageLinkMigrator "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/markdown/MarkdownInlineImageLinkMigrator.py?v=$(date +%s)"
curl -s -o /usr/local/bin/gmail "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/tool/gmail.py?v=$(date +%s)"
curl -s -o /usr/local/bin/tastien "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/crontab/tastien.py?v=$(date +%s)"
curl -s -o /usr/local/bin/waitfor "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/tool/waitfor.py?v=$(date +%s)"
curl -s -o /usr/local/bin/pytar "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/tool/ptar.py?v=$(date +%s)"

chmod +x /usr/local/bin/*
