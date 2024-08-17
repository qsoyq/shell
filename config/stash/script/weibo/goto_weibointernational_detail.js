
function getBodyArgument(key) {
    if (typeof $argument === "undefined") {
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key]
}

function getUrlArgument(string, key) {
    const url = new URL(string);
    const params = new URLSearchParams(url.searchParams);
    return params.get(key)
}

async function main() {
    let url = $request.url
    console.log(`url: ${$request.url}`)
    // 根据 url 判断执行功能
    let userMatch = url.match(/^https?:\/\/(m.weibo.cn|weibo.com)\/u\/(\d+)(.\w+=?\w*)?/)
    if (userMatch) {
        // 访问用户页面
        let uid = userMatch[2]
        let current = new Date().getTime()
        let key = `${$script.name} - userMatch - ${uid}`
        let lastSeen = $persistentStore.read(key)
        console.log(`lastSeen ${uid}: ${lastSeen}`)
        if (lastSeen && (Number(current) - lastSeen) < (10 * 1000)) {
            console.log(`本次跳过`)
        } else {
            let urlscheme = `weibointernational://userinfo?uid=${uid}`
            // https://p.19940731.xyz/redoc#tag/network.url/operation/redirect_api_network_url_redirect_get
            let openUrl = `https://p.19940731.xyz/api/network/url/redirect?url=${encodeURIComponent(urlscheme)}`
            let disableOpenApp = getBodyArgument("disableOpenApp")
            if (!disableOpenApp) {
                $notification.post("微博国际版", urlscheme, urlscheme, { url: openUrl })
            }
            $persistentStore.write(String(current), key)
        }
        return
    }

    // 访问微博详情
    let detailMatch = url.match(/^https:\/\/(weibo.com|m.weibo.cn)\/(status|\d+)\/(\w+|\d+)(.?.+)?$/)
    if (detailMatch) {
        let uid = detailMatch[3]
        let current = new Date().getTime()
        let key = `${$script.name} - blogMatch - ${uid}`
        let lastSeen = $persistentStore.read(key)
        console.log(`lastSeen ${uid}: ${lastSeen}`)
        if (lastSeen && (Number(current) - lastSeen) < (10 * 1000)) {
            console.log(`本次跳过`)
        } else {
            let urlscheme = `weibointernational://detail?mblogid=${uid}`
            // https://p.19940731.xyz/redoc#tag/network.url/operation/redirect_api_network_url_redirect_get
            let openUrl = `https://p.19940731.xyz/api/network/url/redirect?url=${encodeURIComponent(urlscheme)}`
            let disableOpenApp = getBodyArgument("disableOpenApp")
            if (!disableOpenApp) {
                $notification.post("微博国际版", urlscheme, urlscheme, { url: openUrl })
            }
            $persistentStore.write(String(current), key)
        }
        return
    }
}
try {
    main()
} catch (e) {
    console.log(`error: ${e}`)
}

$done({})
