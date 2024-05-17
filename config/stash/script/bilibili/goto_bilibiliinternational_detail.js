function isFromWechat(){
    let ua = $request.headers["User-Agent"]
    const _isFromWechat = /MicroMessenger/i.test(ua);
    return Boolean(_isFromWechat)
}

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

function disableWexinUserAgent(){
    let headers = $request.headers
    let regex = /MicroMessenger\/\d+.?\d*/ig
    headers['User-Agent'] = headers["User-Agent"].replace(regex, "")
    return headers
}

function main(){
    let resp = {}
    let url = $request.url
    console.log(`url: ${url}`)
    if (isFromWechat){
        console.log(`url from wechat: ${url}`) 
        let headers = disableWexinUserAgent()
        resp["headers"] = headers
        console.log(`ua: ${headers["User-Agent"]}`)
    }
    $done(resp)
}

main()
