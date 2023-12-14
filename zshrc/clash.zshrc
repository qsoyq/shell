alias set_clash_proxy="export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890"
alias unset_proxy="unset https_proxy http_proxy all_proxy"
alias edit_clash.yaml="code $HOME/Library/Mobile\ Documents/iCloud~ws~stash~icloud/Documents/clash.yaml"

set_new_network_proxy(){
    echo "Please enter the IP address and port number:"
    read addr
    echo  "https_proxy=http://$addr http_proxy=$addr all_proxy=socks5://$addr"
    export https_proxy=http://$addr http_proxy=$addr all_proxy=socks5://$addr
}
