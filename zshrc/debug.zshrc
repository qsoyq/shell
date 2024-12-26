alias dump_clash_connections="curl -s https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/clash/dump_connections.py | python"
alias dump-http-capture="curl -s https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/stash/dump-http-capture.py | python" 
alias markdown-image-move="markdown_inline_image_link_oss_export && curl -s https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/markdown/MarkdownInlineImageLinkMigrator.py | python -c \"import sys;exec(sys.stdin.read())\" -d ~/Documents/obsidian/Obsidian"
alias json-to-yaml="python -c \"import sys,json,yaml;data=sys.stdin.read();print(yaml.safe_dump(json.loads(data)))\""
alias yaml-to-json="python -c \"import sys,json,yaml;data=sys.stdin.read();print(json.dumps(yaml.safe_load(data), ensure_ascii=False, indent=4))\""
function update-scripts(){
    curl -s -o /usr/local/bin/mikanani-magnet https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/mikanani/filter.py
    chmod +x /usr/local/bin/mikanani-magnet

    curl -s -o /usr/local/bin/replace-all https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/terminal/replace-all.py
    chmod +x /usr/local/bin/replace-all    

    curl -s -o /usr/local/bin/MarkdownInlineImageLinkMigrator https://raw.githubusercontent.com/qsoyq/shell/main/scripts/python/markdown/MarkdownInlineImageLinkMigrator.py
    chmod +x /usr/local/bin/MarkdownInlineImageLinkMigrator
}
