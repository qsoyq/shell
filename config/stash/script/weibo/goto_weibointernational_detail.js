
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
    url = new URL(url)
    let index = url.pathname.lastIndexOf('/')
    if(index !== -1){
        return url.pathname.substring(index + 1);
    }
    return null
}

function main(){
    let url = $request.url
    console.log(`url: ${$request.url}`)
    let blogid = getBlodid(url)
    if(!blogid){
        console.log(`获取 blogid 失败, 当前 url: ${url}`)
    }
    if(blogid === 'baiduad' || blogid === 'banner'){
        console.log(`非预期 blogid, 跳过`)
        $done({})
        return 
    }
    let current = new Date().getTime()
    let key = `${$script.name} - ${blogid}`
    let lastSeen = $persistentStore.read(key)
    console.log(`lastSeen ${blogid}: ${lastSeen}`)
    if(lastSeen && (Number(current) - lastSeen) < (10*1000)){
        console.log(`本次跳过`)
    }else{
        let urlscheme = `weibointernational://detail?mblogid=${blogid}`
        // https://p.19940731.xyz/redoc#tag/network.url/operation/redirect_api_network_url_redirect_get
        let openUrl = `https://p.19940731.xyz/api/network/url/redirect?url=${encodeURIComponent(urlscheme)}`
        let disableOpenApp = getBodyArgument("disableOpenApp")
        if(!disableOpenApp){
            $notification.post("微博国际版", urlscheme, urlscheme, {url: openUrl})
        }
        $persistentStore.write(String(current), key)
    }

    $done({})
}

main()
