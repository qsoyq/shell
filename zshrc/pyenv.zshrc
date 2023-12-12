export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
alias ls_pyenv_bin="ls $(pyenv prefix)/bin"
