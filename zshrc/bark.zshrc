bark_notify(){
    if [[ -v BARK_TOKEN ]]; then
        curl -X POST https://api.day.app/push -H 'Content-Type: application/json; charset=utf-8' -d '{"title": "terminal","body": "命令执行结束", "device_key":"'$BARK_TOKEN'", "group": "MacbookPro", "level": "active"}'
    fi
}
