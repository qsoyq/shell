export FPATH="/usr/local/share/zsh/site-functions:/usr/share/zsh/site-functions:/usr/share/zsh/5.9/functions:"
export FPATH="$HOME/.zfunc:$FPATH"
export FPATH="$HOME/works/github/shell/zfunc/basic.zfunc:$FPATH"

export PATH="$HOME/bin:$PATH"
export PATH="/usr/sbin:$PATH"
export PATH="/System/Cryptexes/App/usr/bin:$PATH"
export PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin:$PATH"

alias pwdcopy="pwd|pbcopy"
alias works="cd $HOME/works"
alias github="cd $HOME/works/github"
alias shell="code $HOME/works/github/shell"
alias app="code $HOME/works/github/services/app"
alias stash="code $HOME/Library/Mobile\ Documents/iCloud~ws~stash~icloud/Documents"

alias reload=". ~/.zshrc"
alias envactive="set -o allexport && . .env"
alias grep='grep --color=auto'
alias timestamp='date +%s'
alias datetime="date \"+%Y-%m-%d %H:%M:%S\""
alias today="date \"+%Y-%m-%d\""
alias history="history 1000"
alias tarfix="gtar --mtime='2024-01-01' --sort=name --numeric-owner -czf"
alias uuid="python -c 'import uuid;print(uuid.uuid4().hex)'"
alias dstorrent="find ~/Movies/Anime -name '*.torrent' -type f -ls -delete "

alias quote="encoder quote"
alias unquote="encoder unquote"


b64encode() {
    python3 -c "import base64; print(base64.urlsafe_b64encode('$1'.encode()).decode())"
}

b64decode() {
    python3 -c "import base64; print(base64.urlsafe_b64decode('$1'.encode('utf-8')).decode())" 
}

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

# 将函数保存到 .zshrc 文件中以便每次启动时生效

HISTFILE="$HOME/.zsh_history"
HISTSIZE=1000
SAVEHIST=100000
# setopt BANG_HIST                 # Treat the '!' character specially during expansion.
# setopt EXTENDED_HISTORY          # Write the history file in the ":start:elapsed;command" format.
# setopt INC_APPEND_HISTORY        # Write to the history file immediately, not when the shell exits.
# setopt SHARE_HISTORY             # Share history between all sessions.
# setopt HIST_EXPIRE_DUPS_FIRST    # Expire duplicate entries first when trimming history.
# setopt HIST_IGNORE_DUPS          # Don't record an entry that was just recorded again.
# setopt HIST_IGNORE_ALL_DUPS      # Delete old recorded entry if new entry is a duplicate.
# setopt HIST_FIND_NO_DUPS         # Do not display a line previously found.
# setopt HIST_IGNORE_SPACE         # Don't record an entry starting with a space.
# setopt HIST_SAVE_NO_DUPS         # Don't write duplicate entries in the history file.
# setopt HIST_REDUCE_BLANKS        # Remove superfluous blanks before recording entry.
# setopt HIST_VERIFY               # Don't execute immediately upon history expansion.
