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
    let url = $request.url
    console.log(`url: ${$request.url}`)
    let ua = $request.headers["User-Agent"]
    const isFromWechat = /MicroMessenger/.test(ua);
    if(!isFromWechat){
        return
    }
    let tid = getUrlArgument(url, "tid")
    let rand = getUrlArgument(url, "rand")
    if(!tid){
        console.error(`获取 tid失败, 当前 url: ${url}`)
    }
    if(rand){
        // 微信浏览器中访问 nga会先重定向到一个带有 rand 参数的 url
        return 
    }
    let ngaUrl = `nga://opentype=2?tid=${tid}&`
    let openUrl = `https://proxy-tool.19940731.xyz/api/network/url/redirect?url=${encodeURIComponent(ngaUrl)}`
    $notification.post("Nga", ngaUrl, ngaUrl, {url: openUrl})
}

main()
$done({})
