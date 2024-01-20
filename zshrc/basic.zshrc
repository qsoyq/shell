export FPATH="/usr/local/share/zsh/site-functions:/usr/share/zsh/site-functions:/usr/share/zsh/5.9/functions:"
export FPATH="$HOME/.zfunc:$FPATH"
export FPATH="$HOME/works/github/shell/zfunc/basic.zfunc:$FPATH"

export PATH="$HOME/bin:$PATH"
export PATH="/System/Cryptexes/App/usr/bin:$PATH"
export PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin:$PATH"

alias pwdcopy="pwd|pbcopy"
alias works="cd $HOME/works"
alias reload=". ~/.zshrc"
alias envactive="set -o allexport && . .env"
alias grep='grep --color=auto'
alias timestamp='date +%s'

HISTFILE="$HOME/.zsh_history"
HISTSIZE=10000000
SAVEHIST=10000000
setopt BANG_HIST                 # Treat the '!' character specially during expansion.
setopt EXTENDED_HISTORY          # Write the history file in the ":start:elapsed;command" format.
setopt INC_APPEND_HISTORY        # Write to the history file immediately, not when the shell exits.
setopt SHARE_HISTORY             # Share history between all sessions.
setopt HIST_EXPIRE_DUPS_FIRST    # Expire duplicate entries first when trimming history.
setopt HIST_IGNORE_DUPS          # Don't record an entry that was just recorded again.
setopt HIST_IGNORE_ALL_DUPS      # Delete old recorded entry if new entry is a duplicate.
setopt HIST_FIND_NO_DUPS         # Do not display a line previously found.
setopt HIST_IGNORE_SPACE         # Don't record an entry starting with a space.
setopt HIST_SAVE_NO_DUPS         # Don't write duplicate entries in the history file.
setopt HIST_REDUCE_BLANKS        # Remove superfluous blanks before recording entry.
setopt HIST_VERIFY               # Don't execute immediately upon history expansion.
