export FPATH="/usr/local/share/zsh/site-functions:/usr/share/zsh/site-functions:/usr/share/zsh/5.9/functions:"
export FPATH="$HOME/.zfunc:$FPATH"
export FPATH="$HOME/works/github/shell/zfunc/basic.zfunc:$FPATH"

export PATH="$HOME/bin:$PATH"
export PATH="/usr/sbin:$PATH"
export PATH="/System/Cryptexes/App/usr/bin:$PATH"
export PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin:$PATH"

alias reload=". ~/.zshrc"
alias envactive="set -o allexport && source .env"
alias grep='grep --color=auto'
alias timestamp='date +%s'
alias datetime="date \"+%Y-%m-%d %H:%M:%S\""
alias today="date \"+%Y-%m-%d\""
alias tarfix="gtar --mtime='2024-01-01' --sort=name --numeric-owner -czf"
alias uuid="python -c 'import uuid;print(uuid.uuid4().hex)'"
alias dstorrent="find ~/Movies/Anime -name '*.torrent' -type f -ls -delete "

alias quote="encoder quote"
alias unquote="encoder unquote"
alias b64encode="encoder b64encode"
alias b64decode="encoder b64decode"

alias human-du="du -ah * | sort -hr | head "
alias human-df="df -h / | awk 'NR==2 {print $5}'"

magnet_url(){
    echo "magnet:?xt=urn:btih:$1"
}

ddxq_search() {
    export keyword=$(urlencode $1)
    curl -X GET "https://maicai.api.ddxq.mobi/search/searchProduct?keyword=${keyword}&page=${page}&station_id=${station_id}" \
        -H "Cookie: ${cookie}"|jq '.data.result_list[] | select(.product_name != null) | 
        {
            "id": .id,
            "商品名称": .product_name,
            "清仓库存": .extMap.expiring_stock,
            "是否缺货": .stockout,
            "库存编码": .stock_number,
            "会员价格": .vip_price,
            "原始价格": .origin_price,
            "当前价格": .price,
            "商品图片": .small_image,
            "网页链接": .web_url,
            "是否缺货提醒": .is_stockout_notify,  
            "阿里小程序地址": .ali_applet_url,
            "微信小程序地址": .wx_applet_url
        }'
}

sg-nnr(){
    curl -X PUT http://127.0.0.1:9090/proxies/Select -d'{"name":"🇸🇬NNR"}'
    curl -X PUT http://127.0.0.1:9090/proxies/Telegram -d'{"name":"🇸🇬NNR"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC1 -d'{"name":"🇸🇬NNR"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC2 -d'{"name":"🇸🇬NNR"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC3 -d'{"name":"🇸🇬NNR"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC4 -d'{"name":"🇸🇬NNR"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC5 -d'{"name":"🇸🇬NNR"}'
}

hk-nnr(){
    curl -X PUT http://127.0.0.1:9090/proxies/Select -d'{"name":"🇭🇰NNR"}'
    curl -X PUT http://127.0.0.1:9090/proxies/Telegram -d'{"name":"🇭🇰NNR"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC1 -d'{"name":"🇭🇰NNR"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC2 -d'{"name":"🇭🇰NNR"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC3 -d'{"name":"🇭🇰NNR"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC4 -d'{"name":"🇭🇰NNR"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC5 -d'{"name":"🇭🇰NNR"}'
}

tg-proxy(){
    curl -X PUT http://127.0.0.1:9090/proxies/Telegram -d'{"name":"PROXY"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC1 -d'{"name":"PROXY"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC2 -d'{"name":"PROXY"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC3 -d'{"name":"PROXY"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC4 -d'{"name":"PROXY"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC5 -d'{"name":"PROXY"}'    
}

tg-dogyun(){
    curl -X PUT http://127.0.0.1:9090/proxies/Telegram -d'{"name":"🇭🇰Dogyun"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC1 -d'{"name":"🇭🇰Dogyun"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC2 -d'{"name":"🇭🇰Dogyun"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC3 -d'{"name":"🇭🇰Dogyun"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC4 -d'{"name":"🇭🇰Dogyun"}'
    curl -X PUT http://127.0.0.1:9090/proxies/TelegramDC5 -d'{"name":"🇭🇰Dogyun"}'    
}

db_set(){
    echo "$1,$2" >> ~/.database.kv
}

db_get(){
    grep "^$1," ~/.database.kv | sed -e "s/^$1,//" | tail -n 1
}

localip_by_mac(){
    echo $(arp -a | grep $1 | awk '{print $2}' | tr -d '()')
}


# 定义 Zsh 函数
remove_duplicates() {
    # 检查是否传入了目录参数
    if [[ -z "$1" ]]; then
        echo "请提供一个目录作为参数。"
        echo "用法: remove_duplicates /path/to/directory"
        return 1
    fi

    # 获取用户提供的目录
    local target_dir="$1"

    # 检查目录是否存在
    if [[ ! -d "$target_dir" ]]; then
        echo "目录 $target_dir 不存在。"
        return 1
    fi

    # 创建一个关联数组保存哈希值和文件路径的映射
    typeset -A filehashes

    # 查找所有文件，计算它们的MD5哈希值
    find "$target_dir" -type f | while read -r file; do
        # 计算文件的MD5哈希值
        local hash
        hash=$(md5 -q "$file")
        
        # 如果哈希值已经存在，说明是重复文件，删除它
        if [[ -n "${filehashes[$hash]}" ]]; then
            echo "删除重复文件: $file"
            trash "$file"
        else
            # 否则，记录该文件的哈希值
            filehashes[$hash]="$file"
        fi
    done
}

# /Users/qs/Documents/obsidian/obsidian/Journal/Pasted Image 20241014150712.jpeg
# upload_file_to_telegraph /Users/qs/Documents/obsidian/obsidian/Journal/Pasted\ Image\ 20241014150712.jpeg
# 定义文件上传函数
upload_file_to_telegraph() {
    local file_path=$1
    local host="https://telegraph.19940731.xyz"
    
    # 检查文件是否存在
    if [ ! -f "$file_path" ]; then
        echo "File not found: $file_path"
        return 1
    fi

    # 使用 curl 上传文件
    local response=$(curl -s -F "file=@$file_path" "$host"/upload)

    # 从 JSON 响应中提取 error 字段
    local error=$(echo "$response" | jq -r '.[0].error')

    if [[ "$error" != "null" ]]; then
        echo "$error"
        return 1
    fi    

    # 从 JSON 响应中提取 src 字段的值
    local src=$(echo "$response" | jq -r '.[0].src')

    # 检查是否成功提取到 src 值
    if [[ -z "$src" || "$src" == "null" ]]; then
        echo "Error: 'src' not found in the response"
        return 1
    fi

    # 返回完整的 src URL
    echo "![]($host$src)"
    return 0
}

