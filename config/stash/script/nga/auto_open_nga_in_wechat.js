const printObj = function(body){
    for (const key in body) {
        console.log(`    ==> Key: ${key}, Value: ${body[key]}`);
    }    
}

function main(){
    let url = $request.url
    const match = url.match(/tid=(\d+)/);
    const tid = match[1];
    console.log(`url: ${$request.url}, tid: ${tid}`)
    // printObj($request.headers)
    let ua = $request.headers["User-Agent"]
    const isFromWechat = /MicroMessenger/.test(ua);
    if(!isFromWechat){
        return
    }
    let ngaUrl = encodeURIComponent(`nga://opentype=2?tid=${tid}&`)
    let openUrl = `https://proxy-tool.19940731.xyz/api/network/url/redirect?url=${ngaUrl}`
    
    $notification.post("Nga", tid, openUrl, {url: openUrl})
}

main()
$done({})
