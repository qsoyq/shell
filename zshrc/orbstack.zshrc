export PATH="/Users/qs/.orbstack/bin:$PATH"

alias dc="docker compose"
alias dn="docker network"
alias drmi="docker images --format "{{.ID}}" | xargs docker rmi"
alias join_shared_network='docker ps -aq|python3 -c "import sys,os;data=sys.stdin.read();li=data.strip().split(\"\n\");list(map(lambda x: os.system(f\"docker network connect shared_network {x}\"), li))"'

orb_restart_for_cloudflared_tunnel(){
    docker restart cloudflared-tunnel
}

start_all_services(){
    if [[ -d "$HOME/works/github/services" ]]; then
        for file in "$HOME/works/github/services"/*/docker-compose.yml; do
            if [[ -f "$file" ]]; then
                echo "file: $file"
                docker compose -f $file up -d
            fi
        done
    fi
}
