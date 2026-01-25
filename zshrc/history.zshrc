

alias history="history 1000"
HISTFILE="$HOME/.zsh_history"
HISTSIZE=100000
SAVEHIST=100000


# setopt BANG_HIST                 # 在扩展过程中特别处理'!'字符。
setopt EXTENDED_HISTORY          # 以":start:elapsed;command"格式写入历史文件。
setopt INC_APPEND_HISTORY        # 立即写入历史文件，而不是等到shell退出时。
# setopt SHARE_HISTORY             # 在所有会话之间共享历史记录。
setopt HIST_EXPIRE_DUPS_FIRST    # 修剪历史记录时首先删除重复条目。
# setopt HIST_IGNORE_DUPS          # 不记录刚刚记录过的重复条目。
setopt HIST_IGNORE_ALL_DUPS      # 如果新条目是重复的，则删除旧记录的条目。
# setopt HIST_FIND_NO_DUPS         # 不显示之前找到过的行。
setopt HIST_IGNORE_SPACE         # 不记录以空格开头的条目。
# setopt HIST_SAVE_NO_DUPS         # 不在历史文件中写入重复条目。
setopt HIST_REDUCE_BLANKS        # 在记录条目之前删除多余的空格。
# setopt HIST_VERIFY               # 不在历史扩展后立即执行命令。

export HISTCONTROL=ignoreboth:erasedups #zsh 使 history 中不包含重复项
