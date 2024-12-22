alias dump_clash_connections="curl https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/clash/dump_connections.py | python"
alias dump-http-capture="curl https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/stash/dump-http-capture.py | python" 
alias markdown-image-move="markdown_inline_image_link_oss_export && curl -s https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/markdown/MarkdownInlineImageLinkMigrator.py | python -c \"import sys;exec(sys.stdin.read())\" -d ~/Documents/obsidian/Obsidian"
