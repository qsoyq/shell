export HOMEBREW_NO_ENV_HINTS="1"
export HOMEBREW_NO_AUTO_UPDATE="1"
export HOMEBREW_PREFIX="/opt/homebrew"
export HOMEBREW_CELLAR="/opt/homebrew/Cellar"
export HOMEBREW_REPOSITORY="/opt/homebrew"

export MANPATH="/opt/homebrew/share/man:/opt/homebrew/share/man:$MANPATH"

export shell_scripts_homebrew_dir="$HOME/works/github/shell/scripts/homebrew"

export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"
export PATH="/opt/homebrew/sbin:$PATH"


alias init_homebrew="bash ${shell_scripts_homebrew_dir}/init_brew.sh"
alias brew_install_recipes="bash ${shell_scripts_homebrew_dir}/brew_install_recipes.sh"

