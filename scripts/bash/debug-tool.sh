#!/bin/bash
pip --quiet install httpx bs4 typer rich tabulate socksio ipython
curl -s -o /usr/local/bin/mikanani-magnet "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/mikanani/filter.py?v=$(date +%s)"
curl -s -o /usr/local/bin/replace-all "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/terminal/replace-all.py?v=$(date +%s)"
curl -s -o /usr/local/bin/MarkdownInlineImageLinkMigrator "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/markdown/MarkdownInlineImageLinkMigrator.py?v=$(date +%s)"
curl -s -o /usr/local/bin/gmail "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/tool/gmail.py?v=$(date +%s)"
curl -s -o /usr/local/bin/tastien "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/crontab/tastien.py?v=$(date +%s)"
curl -s -o /usr/local/bin/waitfor "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/tool/waitfor.py?v=$(date +%s)"
curl -s -o /usr/local/bin/pytar "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/tool/ptar.py?v=$(date +%s)"
curl -s -o /usr/local/bin/duplicate "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/tool/duplicate.py?v=$(date +%s)"
curl -s -o /usr/local/bin/markdown-table "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/markdown/table.py?v=$(date +%s)"
curl -s -o /usr/local/bin/clear-docker-log "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/tool/clear-docker-log.py?v=$(date +%s)"
curl -s -o /usr/local/bin/url-watcher "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/python/tool/url-watcher.py?v=$(date +%s)"

chmod +x /usr/local/bin/*
