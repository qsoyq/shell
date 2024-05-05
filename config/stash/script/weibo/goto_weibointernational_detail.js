function getBodyArgument(key){
    if (typeof $argument === "undefined"){
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key]
}


const printObj = function(body){
    for (const key in body) {
        console.log(`    ==> Key: ${key}, Value: ${body[key]}`);
    }    
}

function getUrlArgument(string, key){
    const url = new URL(string);
    const params = new URLSearchParams(url.searchParams);
    return params.get(key)
}

function getBlodid(url){
    let index = url.lastIndexOf('/')
    if(index !== -1){
        return url.substring(index + 1);
    }
    return null
}

function main(){
    // printObj($request.headers)
    let resp = {}
    let url = $request.url
    console.log(`url: ${$request.url}`)
    const isFromWechat = /MicroMessenger/.test(ua);
    if(!isFromWechat){
        $done(resp)
        return
    }
    let blogid = getBlodid(url)
    if(!blogid){
        console.error(`获取 blogid 失败, 当前 url: ${url}`)
    }
    let urlscheme = `weibointernational://detail?mblogid=${blogid}`
    // https://proxy-tool.19940731.xyz/redoc#tag/network.url/operation/redirect_api_network_url_redirect_get
    let openUrl = `https://proxy-tool.19940731.xyz/api/network/url/redirect?url=${encodeURIComponent(urlscheme)}`
    let disableOpenApp = getBodyArgument("disableOpenApp")
    if(!disableOpenApp){
        $notification.post("微博国际版", urlscheme, urlscheme, {url: openUrl})
    }
    $done(resp)
}

main()
