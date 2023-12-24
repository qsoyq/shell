alias g="git"
alias g_am="git commit -am"
alias g_quick_push="g add . && g commit -am\"update\" && g push"
alias wl='git log --pretty=format:"%ad: %s" --date=short --after=(date -v-6d +"%Y-%m-%d") --author=(git config user.name)'
alias g_blame_ignore="git config --local blame.ignoreRevsFile .git-blame-ignore-revs"
