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

function main(){
    // printObj($request.headers)

    let resp = {}
    let url = $request.url
    console.log(`url: ${$request.url}`)
    let ua = $request.headers["User-Agent"]
    const isFromWechat = /MicroMessenger/.test(ua);
    if(!isFromWechat){
        $done(resp)
        return
    }

    let cid = getBodyArgument("cid")
    let uid = getBodyArgument("uid")
    
    if(cid && uid){
        let cookies=`ngaPassportUid=${uid}; ngaPassportCid=${cid}`
        resp["headers"] = {"Cookie": cookies}
        console.log(`Modify the request header to add the login state, cookies: ${cookies}`)
    }    
    let tid = getUrlArgument(url, "tid")
    let rand = getUrlArgument(url, "rand")
    if(!tid){
        console.error(`获取 tid失败, 当前 url: ${url}`)
    }
    if(rand){
        // 微信浏览器中访问 nga会先重定向到一个带有 rand 参数的 url
        $done(resp)
        return 
    }
    let ngaUrl = `nga://opentype=2?tid=${tid}&`
    // https://p.19940731.xyz/redoc#tag/network.url/operation/redirect_api_network_url_redirect_get
    let openUrl = `https://p.19940731.xyz/api/network/url/redirect?url=${encodeURIComponent(ngaUrl)}`
    let disableOpenApp = getBodyArgument("disableOpenApp")
    if(!disableOpenApp){
        $notification.post("Nga", ngaUrl, ngaUrl, {url: openUrl})
    }
    $done(resp)
    // $notification.post("Nga", ngaUrl, ngaUrl, {url: ngaUrl})
}

main()
