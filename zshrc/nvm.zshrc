# export NVM_DIR="$HOME/.nvm"
# export NVM_CD_FLAGS="-q"
# export NVM_BIN="$HOME/.nvm/versions/node/v16.20.2/bin"
# export NVM_INC="$HOME/.nvm/versions/node/v16.20.2/include/node"

# export MANPATH="$HOME/.nvm/versions/node/v16.20.2/share/man:$MANPATH"
# export PATH="$NVM_BIN:$PATH"

# if ! command -v nvm >/dev/null 2>&1; then
#   echo "nvm 未安装，正在使用 Homebrew 安装 nvm..."
#   brew install nvm
#   mkdir -p ~/.nvm
# fi
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"  # This loads nvm
[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion
