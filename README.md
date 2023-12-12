# shell

## 导入指定目录下的zshrc文件

```bash
if [[ -d "$directory_to_search" ]]; then
    # 遍历指定目录下所有以 .zshrc 结尾的文件
    for file in "$directory_to_search"/zshrc/*.zshrc; do
        if [[ -f "$file" ]]; then
            echo "Sourcing $file"
            source "$file"
        fi
    done
else
    echo "Directory '$directory_to_search' does not exist."
fi
```
