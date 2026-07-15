export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"

# rm ~/.pyenv/shims/.pyenv-shim
eval "$(pyenv init - --no-rehash)"
alias ls_pyenv_bin="ls $(pyenv prefix)/bin"
