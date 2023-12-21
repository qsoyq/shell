export PATH="/Users/qs/.orbstack/bin:$PATH"

alias dc="docker compose"
alias dn="docker network"

join_docker_network(){
    # 定义要加入的网络名称
    NETWORK_NAME="shared_network"
    CONTAINERS=$(docker ps -aq)
    echo $CONTAINERS | xargs -I {} docker network connect "$NETWORK_NAME" {}
}

orb_restart_for_cloudflared_tunnel(){
    docker restart cloudflared-tunnel
}