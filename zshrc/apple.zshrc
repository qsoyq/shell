# pmset
alias enablesleep="sudo pmset -b sleep 5; sudo pmset -b disablesleep 0"
alias disablesleep="sudo pmset -b sleep 0; sudo pmset -b disablesleep 1"

# Delete Apple System Logs
alias dasl="sudo rm -rf /private/var/log/asl/*.asl"

# Flush SPM caches
alias dspm="rm -rf $HOME/Library/Caches/org.swift.swiftpm/;rm -rf $HOME/Library/org.swift.swiftpm"

# Flush Directory Service cache
alias flushdns="dscacheutil -flushcache; sudo killall -HUP mDNSResponder"

# Recursively delete `.DS_Store` files
# alias dsstore="find $HOME -name '*.DS_Store' -type f -ls -delete"
alias _dsstore_github="find $HOME/works/github -name '*.DS_Store' -type f -ls -delete"
alias _dsstore_desktop="find $HOME/Desktop -name '*.DS_Store' -type f -ls -delete"
alias _dsstore_movies="find $HOME/Movies -name '*.DS_Store' -type f -ls -delete"
alias _dsstore_downloads="find $HOME/Downloads -name '*.DS_Store' -type f -ls -delete"
alias _dsstore_works="find $HOME/works -name '*.DS_Store' -type f -ls -delete"
alias dsstore="_dsstore_github && _dsstore_desktop && _dsstore_works && _dsstore_movies && _dsstore_downloads"

# Get WAN IP
# alias ip="dig +short myip.opendns.com @resolver1.opendns.com"

# Get local IP
alias localip="ipconfig getifaddr en0"

# M1
alias ibrew="arch -x86_64 /usr/local/bin/brew"
alias mbrew="arch -arm64e /opt/homebrew/bin/brew"
alias m1ipa="sudo xattr -dr com.apple.quarantine"
alias ipadir="open ~/Library/Group\ Containers/K36BKF7T3D.group.com.apple.configurator/Library"
alias airport="/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport"


# WiFI
# networksetup -listallhardwareports
# alias wifi_f50="sudo ifconfig en0 192.168.0.148 netmask 255.255.255.0 &&  sudo route add default gw 192.168.0.148 && sudo ifconfig en0 down && sudo ifconfig en0 up"
# alias wifi_b340="sudo ifconfig en0 29.62.253.82 netmask 255.255.255.0 &&  sudo route add default gw 29.62.253.1 && sudo ifconfig en0 down && sudo ifconfig en0 up"

alias compgen="bash -c 'compgen -c'"
