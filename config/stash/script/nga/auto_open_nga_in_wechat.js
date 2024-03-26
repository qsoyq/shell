const printObj = function(body){
    for (const key in body) {
        console.log(`    ==> Key: ${key}, Value: ${body[key]}`);
    }    
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
    const match = url.match(/tid=(\d+)/);
    const tid = match ? match[1] : null    
    if(!tid){
        console.error(`获取 tid失败, 当前 url: ${url}`)
    }
    let ngaUrl = `nga://opentype=2?tid=${tid}&`
    let openUrl = `https://proxy-tool.19940731.xyz/api/network/url/redirect?url=${encodeURIComponent(ngaUrl)}`
    $notification.post("Nga", ngaUrl, ngaUrl, {url: openUrl})
}

main()
$done({})
