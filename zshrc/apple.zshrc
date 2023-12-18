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
alias _dsstore_share="find $HOME/works/share -name '*.DS_Store' -type f -ls -delete"
alias dsstore="_dsstore_github && _dsstore_desktop && _dsstore_share"



# Get WAN IP
alias ip="dig +short myip.opendns.com @resolver1.opendns.com"

# Get local IP
alias localip="ipconfig getifaddr en0"

# M1
alias ibrew="arch -x86_64 /usr/local/bin/brew"
alias mbrew="arch -arm64e /opt/homebrew/bin/brew"
alias m1ipa="sudo xattr -dr com.apple.quarantine"
alias ipadir="open ~/Library/Group\ Containers/K36BKF7T3D.group.com.apple.configurator/Library"
alias airport="/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport"
