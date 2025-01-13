alias uc='curl -sL "https://raw.githubusercontent.com/qsoyq/shell/refs/heads/main/scripts/bash/debug-tool.sh?v=$(date +%s)" | bash'

# alias
alias unicode-escape='python3 -c "import sys;data=sys.stdin.read();print(data.encode(\"unicode-escape\").decode(),end=\"\")"'
alias unicode-deescape='python3 -c "import sys;data=sys.stdin.read();print(data.encode(\"utf-8\").decode(\"unicode_escape\"),end=\"\")"'
alias dump_clash_connections="curl -s https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/clash/dump_connections.py | python3"
alias dump-http-capture="curl -s https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/stash/dump-http-capture.py | python3" 
alias markdown-image-move="markdown_inline_image_link_oss_export && MarkdownInlineImageLinkMigrator -d ~/Documents/obsidian/Obsidian"
alias json-to-yaml="python3 -c \"import sys,json,yaml;data=sys.stdin.read();print(yaml.safe_dump(json.loads(data)))\""
alias yaml-to-json="python3 -c \"import sys,json,yaml;data=sys.stdin.read();print(json.dumps(yaml.safe_load(data), ensure_ascii=False, indent=4))\""
