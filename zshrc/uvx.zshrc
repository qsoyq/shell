# uvx from GitHub
# 用法: uvx-gh [--user <user>] <tool> [args...]
#   始终从 https://github.com/<user>/<tool> 拉取,默认 user=qsoyq
#   首次执行后由 uvx 自身缓存环境,后续运行不再 clone
uvx-gh() {
    local user="qsoyq"
    local -a rest

    while (( $# > 0 )); do
        case "$1" in
            --user)
                if [[ -z "${2:-}" ]]; then
                    echo "uvx-gh: --user requires a value" >&2
                    return 1
                fi
                user="$2"
                shift 2
                ;;
            --user=*)
                user="${1#--user=}"
                shift
                ;;
            --)
                shift
                rest+=("$@")
                break
                ;;
            *)
                rest+=("$1")
                shift
                ;;
        esac
    done

    if (( ${#rest[@]} == 0 )); then
        echo "Usage: uvx-gh [--user <user>] <tool> [args...]" >&2
        return 1
    fi

    local tool="${rest[1]}"
    uvx --from "git+https://github.com/$user/$tool" "$tool" "${rest[@]:1}"
}
