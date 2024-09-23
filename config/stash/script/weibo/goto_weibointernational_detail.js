
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

/**
 * 匹配用互详情页
 * @returns 
 */
function userMatch() {
    // 访问用户页面
    let url = $request.url
    let userMatch = url.match(/^https?:\/\/(m.weibo.cn|weibo.com)\/u\/(\d+)(.\w+=?\w*)?/)
    if (userMatch) {
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
    }
}

/**
 * 匹配微博详情页
 * @returns 
 */
function blogMatch() {
    // 访问微博详情
    let url = $request.url
    let detailMatch = url.match(/^https:\/\/(weibo.com|m.weibo.cn)\/(status|detail)\/(\d+)(.?.+)?$/)
    let uid, key, lastSeen
    let current = new Date().getTime()
    if (detailMatch) {
        uid = detailMatch[3]
        key = `${$script.name} - blogMatch - ${uid}`
        lastSeen = $persistentStore.read(key)
    }
    if (!detailMatch) {
        detailMatch = url.match(/https:\/\/(weibo.com|m.weibo.cn)\/\d+\/(\w+)(#\w+)?/)
        if (detailMatch) {
            uid = detailMatch[2]
            key = `${$script.name} - blogMatch - ${uid}`
            lastSeen = $persistentStore.read(key)
        }
    }

    if (detailMatch) {
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
    }
}


async function main() {
    console.log(`url: ${$request.url}`)
    userMatch()
    blogMatch()
}

try {
    main()
} catch (e) {
    console.log(`error: ${e}`)
}

$done({})
