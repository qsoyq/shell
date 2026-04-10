# brew install android-platform-tools
# adb devices
# adb install app.apk
# adb install -r app.apk
# adb exec-out screencap -p > screen.png
alias adb-screen="adb exec-out screencap -p > screen.png"

# 安装 .apks 文件到安卓设备
# .apks 文件是 Android App Bundle 格式，包含多个 apk 文件
# 支持文件名补全和交互式选择
apks-install() {
    local apks_file
    
    if [[ $# -eq 0 ]]; then
        # 如果没有提供参数，尝试使用 fzf 或 select 交互式选择
        if command -v fzf >/dev/null 2>&1; then
            apks_file=$(find . -maxdepth 1 -name "*.apks" -type f | fzf --height=40% --prompt="选择 APKS 文件: ")
        else
            # 使用 zsh 的 select 命令
            local apks_files=($(find . -maxdepth 1 -name "*.apks" -type f))
            if [[ ${#apks_files[@]} -eq 0 ]]; then
                echo "错误: 当前目录下没有找到 .apks 文件"
                return 1
            fi
            echo "请选择要安装的 APKS 文件:"
            select apks_file in "${apks_files[@]}"; do
                if [[ -n "$apks_file" ]]; then
                    break
                fi
            done
        fi
        
        if [[ -z "$apks_file" ]]; then
            echo "错误: 未选择文件"
            return 1
        fi
    else
        apks_file="$1"
    fi
    
    # 检查文件是否存在
    if [[ ! -f "$apks_file" ]]; then
        echo "错误: 文件不存在: $apks_file"
        return 1
    fi
    
    # 检查是否是 apks 文件
    if [[ ! "$apks_file" =~ \.(apks|APKS)$ ]]; then
        echo "警告: 文件扩展名不是 .apks，是否继续? (y/N)"
        read -r confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    # 检查 adb 是否可用
    if ! command -v adb >/dev/null 2>&1; then
        echo "错误: adb 命令未找到，请先安装 android-platform-tools"
        return 1
    fi
    
    # 检查设备连接
    if ! adb devices | grep -q "device$"; then
        echo "错误: 未检测到已连接的安卓设备"
        echo "请运行 'adb devices' 检查设备连接状态"
        return 1
    fi
    
    # 安装 apks 文件
    # .apks 文件是 zip 压缩包，包含多个 apk 文件，需要使用 install-multiple 安装
    echo "正在安装: $apks_file"
    
    java -jar bundletool.jar install-apks --apks="$apks_file"
    # 使用 install-multiple 安装所有 apk 文件
    adb install-multiple -r "${apk_files[@]}"
}

_apks-install() {
    _files -g "*.apks"
}

# compdef _apks-install apks-install
