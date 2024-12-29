#!/bin/bash
ts=$(date +%s)
pip --quiet install httpx bs4 typer rich
curl -s -o /usr/local/bin/mikanani-magnet "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/mikanani/filter.py?v=$ts"
curl -s -o /usr/local/bin/replace-all "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/terminal/replace-all.py?v=$ts"
curl -s -o /usr/local/bin/MarkdownInlineImageLinkMigrator "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/markdown/MarkdownInlineImageLinkMigrator.py?v=$ts"
curl -s -o /usr/local/bin/gmail "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/tool/gmail.py?v=$ts"
curl -s -o /usr/local/bin/tastien "https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/crontab/tastien.py?v=$ts"
chmod +x /usr/local/bin/*
