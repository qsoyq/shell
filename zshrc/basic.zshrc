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

