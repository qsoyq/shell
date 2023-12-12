export LDFLAGS="-L/opt/homebrew/opt/openssl@3/lib $LDFLAGS"
export LDFLAGS="-L/usr/local/opt/readline/lib $LDFLAGS"

export CPPFLAGS="-I/opt/homebrew/opt/openssl@3/include $CPPFLAGS"
export CPPFLAGS="-I/usr/local/opt/readline/include $CPPFLAGS"

export PKG_CONFIG_PATH="/usr/local/opt/readline/lib/pkgconfig $PKG_CONFIG_PATH"

export PATH="/opt/homebrew/opt/openssl@3/bin:$PATH"
export PATH="/usr/local/opt/openssl/bin:$PATH"
