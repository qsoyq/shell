# uvx from GitHub
# 用法: uvx-gh [uvx-options...] [--user <user>] <tool>[@<ref>] [tool-args...]
#   始终从 https://github.com/<user>/<tool> 拉取,默认 user=qsoyq
#   除 --user 由本函数捕获外,tool 名之前的 uvx 选项(如 --refresh / --reinstall / --with) 透传给 uvx
#   tool 名之后的所有参数原样传给 tool 自身
#   使用 -- 可以强制把后续全部当作 tool 参数
#   <tool>@latest 自动追加 --refresh 拉最新 HEAD; <tool>@<ref> 会作为 git ref 附加到 URL
# uvx-gh() {
#     local user="qsoyq"
#     local -a uvx_flags
#     local -a positional
#     local in_flags=1

#     while (( $# > 0 )); do
#         case "$1" in
#             --user)
#                 if (( in_flags )); then
#                     if [[ -z "${2:-}" ]]; then
#                         echo "uvx-gh: --user requires a value" >&2
#                         return 1
#                     fi
#                     user="$2"
#                     shift 2
#                 else
#                     positional+=("$1")
#                     shift
#                 fi
#                 ;;
#             --user=*)
#                 if (( in_flags )); then
#                     user="${1#--user=}"
#                     shift
#                 else
#                     positional+=("$1")
#                     shift
#                 fi
#                 ;;
#             --)
#                 shift
#                 positional+=("$@")
#                 break
#                 ;;
#             -*)
#                 if (( in_flags )); then
#                     case "$1" in
#                         --from|--with|--with-editable|--with-requirements|\
#                         --python|-p|\
#                         --refresh-package|--reinstall-package|\
#                         --upgrade-package|-P|\
#                         --no-build-package|--no-binary-package|\
#                         --index|--default-index|--index-url|--extra-index-url|--find-links|\
#                         --cache-dir|--config-file|--directory|--project|\
#                         --exclude-newer|--index-strategy|--keyring-provider|\
#                         --resolution|--prerelease|--link-mode|--color)
#                             if [[ -z "${2:-}" ]]; then
#                                 echo "uvx-gh: $1 requires a value" >&2
#                                 return 1
#                             fi
#                             uvx_flags+=("$1" "$2")
#                             shift 2
#                             ;;
#                         *)
#                             uvx_flags+=("$1")
#                             shift
#                             ;;
#                     esac
#                 else
#                     positional+=("$1")
#                     shift
#                 fi
#                 ;;
#             *)
#                 in_flags=0
#                 positional+=("$1")
#                 shift
#                 ;;
#         esac
#     done

#     if (( ${#positional[@]} == 0 )); then
#         echo "Usage: uvx-gh [uvx-options...] [--user <user>] <tool>[@<ref>] [tool-args...]" >&2
#         return 1
#     fi

#     local raw="${positional[1]}"
#     local tool="$raw"
#     local ref=""
#     if [[ "$raw" == *@* ]]; then
#         tool="${raw%@*}"
#         ref="${raw#*@}"
#     fi

#     local from="git+https://github.com/$user/$tool"
#     if [[ "$ref" == "latest" ]]; then
#         uvx_flags+=(--refresh)
#     elif [[ -n "$ref" ]]; then
#         from="$from@$ref"
#     fi

#     uvx "${uvx_flags[@]}" --from "$from" "$tool" "${positional[@]:1}"
# }
