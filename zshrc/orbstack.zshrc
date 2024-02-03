export PATH="/Users/qs/.orbstack/bin:$PATH"

alias dc="docker compose"
alias dn="docker network"
alias drmi="docker images --format "{{.ID}}" | xargs docker rmi"

join_docker_network(){
    # 定义要加入的网络名称
    NETWORK_NAME="shared_network"
    CONTAINERS=$(docker ps -aq)
    echo $CONTAINERS | xargs -I {} docker network connect "$NETWORK_NAME" {}
}

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
