# Outputs are logged to /Library/Logs/com.cloudflare.cloudflared.err.log and /Library/Logs/com.cloudflare.cloudflared.out.log
# Outputs are logged to /Users/qs/Library/Logs/com.cloudflare.cloudflared.err.log and /Users/qs/Library/Logs/com.cloudflare.cloudflared.out.log


# export TUNNEL_ORIGIN_CERT="$HOME/.cloudflared/"

alias cloudflared.restart="sudo launchctl stop com.cloudflare.cloudflared && sudo launchctl start com.cloudflare.cloudflared"

alias tailf_cloudflared="tail -f $HOME/Library/Logs/com.cloudflare.cloudflared.err.log $HOME/Library/Logs/com.cloudflare.cloudflared.out.log"
alias restart_cloudflared_tunnel_while_network_changed="curl -fsSL http://myip.19940731.xyz > /dev/null || docker restart cloudflared-tunnel"
