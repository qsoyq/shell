#!/bin/sh
if [ -e "/opt/homebrew/bin/brew" ]; then
    echo "Unsupported distribution"
    cat /etc/os-release
    exit 1
elif [ -e "/usr/bin/apt" ]; then
    apt update &&  apt install python3-venv python3-pip -y
elif [ -e "/usr/bin/yum" ]; then
    echo "Unsupported distribution"
    cat /etc/os-release
    exit 1
elif [ -e "/usr/bin/dnf" ]; then
    echo "Unsupported distribution"
    cat /etc/os-release
    exit 1
elif [ -e "/usr/bin/pacman" ]; then
    echo "Unsupported distribution"
    cat /etc/os-release
    exit 1
elif [ -e "/sbin/apk" ]; then
    echo "Unsupported distribution"
    cat /etc/os-release
    exit 1
else
    echo "Unsupported distribution"
    cat /etc/os-release
    exit 1
fi

python3 -m venv "$HOME"/python
echo ". $HOME/python/bin/activate" >> "$HOME/.bash_profile"
echo "export PATH=~/python/bin:$PATH" >> "$HOME/.bash_profile"

# shellcheck source=/dev/null
. "$HOME"/.bash_profile
