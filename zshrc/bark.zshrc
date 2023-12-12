bark_notify(){
    if [[ -v BARK_TOKEN ]]; then
        curl "https://api.day.app/${BARK_TOKEN}/terminal%20notify"; 
    fi
}
