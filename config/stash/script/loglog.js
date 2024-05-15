function parseCookie(cookie){
    if (typeof(cookie) !== "string"){
        console.log(`illegally cookie: ${cookie}`)
        return
    }
    let body = {}
    cookie.split(";").forEach(element=>{
        if(element){
            // let arr = element.trim().split("=")
            element = element.trim()
            let index = element.indexOf("=")
            if(index === -1){
                console.log(`illegally cookie field: ${element}`)
                return
            }else{
                let key = element.substring(0, index)
                let value =  element.substring(index+1)
                body[key] = value
            }
        }
    })
    return body
}

function read(key){
    $persistentStore.read(key)
}

function write(key, val){
    $persistentStore.write(val, key)
}

function getCookie(key){
    return $persistentStore.read(`Cookie.${key}`)
}

function setCookie(key, val){
    return $persistentStore.write(val, `Cookie.${key}`)
}

function notificationPost(){
    $notification.post(`titile`, `subtitle`, `content`)
}

function isFromWechat(){
    let ua = $request.headers["User-Agent"]
    const _isFromWechat = /MicroMessenger/.test(ua);
    return Boolean(_isFromWechat)
}

function randomChar(num) {
    const min = 65; // 'A' 的 ASCII 码
    const max = 90; // 'Z' 的 ASCII 码
    let chars = []
    for(let i=0; i<num;i++){
        let char = String.fromCharCode(Math.floor(Math.random() * (max - min + 1)) + min)
        chars.push(char)
    }
    
    return chars.join("")
}

function getLocalDateString(date){
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${year}-${month}-${day} ${hours}:${minutes}`
}

const printObj = function(body){
    for (const key in body) {
        console.log(`    ==> Key: ${key}, Value: ${body[key]}`);
    }    
}

function getBodyArgument(key){
    if (typeof $argument === "undefined"){
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key] || $persistentStore.read(key)
}

function getArgumentObject(key){
    if (typeof $argument === "undefined"){
        return undefined
    }
    let body = JSON.parse($argument)
    return body
}

function main(){
    console.log(`${getLocalDateString(new Date())}`)
    // $notification.post(`titile`, `subtitle`, `content`)
    $done({})
}
main()
