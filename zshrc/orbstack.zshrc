export PATH="/Users/qs/.orbstack/bin:$PATH"

alias dc="docker compose"
alias dn="docker network"
alias drmi="docker images --format "{{.ID}}" | xargs docker rmi"
alias join_shared_network='docker ps -aq|python3 -c "import sys,os;data=sys.stdin.read();li=data.strip().split(\"\n\");list(map(lambda x: os.system(f\"docker network connect shared_network {x}\"), li))"'
