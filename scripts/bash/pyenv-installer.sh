#!/bin/sh
if [ -e "/opt/homebrew/bin/brew" ]; then
    brew install openssl readline sqlite3 xz zlib tcl-tk@8 libb2
elif [ -e "/usr/bin/apt" ]; then
    apt update &&  apt install build-essential libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libsqlite3-dev curl git \
    libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev -y
elif [ -e "/usr/bin/yum" ]; then
    yum install gcc make patch zlib-devel bzip2 bzip2-devel readline-devel sqlite sqlite-devel openssl-devel tk-devel libffi-devel xz-devel -y
    yum install openssl11-devel -y
elif [ -e "/usr/bin/dnf" ]; then
    dnf install make gcc patch zlib-devel bzip2 bzip2-devel readline-devel sqlite sqlite-devel openssl-devel tk-devel libffi-devel xz-devel libuuid-devel gdbm-libs libnsl2 -y
elif [ -e "/usr/bin/pacman" ]; then
    pacman -S --needed base-devel openssl zlib xz tk --noconfirm
elif [ -e "/sbin/apk" ]; then
    apk add --no-cache git bash build-base libffi-dev openssl-dev bzip2-dev zlib-dev xz-dev readline-dev sqlite-dev tk-dev
else
    echo "未匹配的发行版"
    exit 1
fi

curl https://pyenv.run | bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init - bash)"' >> ~/.bashrc

touch ~/.bash_profile

echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bash_profile
echo '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bash_profile
echo 'eval "$(pyenv init - bash)"' >> ~/.bash_profile
source ~/.bash_profile

pacman -S --needed base-devel openssl zlib xz tk
