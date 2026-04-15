claude-all() {
    claude --permission-mode bypassPermissions  --allow-dangerously-skip-permissions "$@"
}

c() {
    claude  --dangerously-skip-permissions --permission-mode bypassPermissions  --allow-dangerously-skip-permissions "$@"
}
