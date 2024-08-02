function getBodyArgument(key){
    if (typeof $argument === "undefined"){
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key]
}

function getLocalDateString(date){
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`
}
function getRequestCacheKey(){
    let today = getLocalDateString(new Date())
    let key = `flyairport-checkin-${today}`    
    return key
}

function ifRequest(){
    let key = getRequestCacheKey()
    return !Boolean($persistentStore.read(key))
}

function main(){
    let email = getBodyArgument("email")
    if(!email){
        console.log("email undefined")
        $done()
        return
    }

    let passwd = getBodyArgument("passwd")
    if(!passwd){
        console.log("passwd undefined")
        $done()
        return
    }
    let payload = {
        email: email,
        passwd: passwd
    }
    let cacheKey = getRequestCacheKey()
    if (ifRequest()){
        url = "https://p.19940731.xyz/api/api/checkin/flyairport/v2"
        $httpClient.post({url: url, headers: {"content-type":"application/json"}, body: JSON.stringify(payload)}, (error, _, data)=>{
            if(error){
                console.log(`请求失败 ${error}`)
                $notification.post($script.name, "签到失败", `${cacheKey}\n${error}`)
            }else{
                let body = JSON.parse(data)
                console.log(`签到完成, ${cacheKey} ${body['msg']}`)
                $notification.post($script.name, "签到成功", `${cacheKey}\n${body['msg']}`)
                let today = getLocalDateString(new Date())
                $persistentStore.write(today, cacheKey)
            }
            $done()
        })
    }else{
        console.log(`${cacheKey}已签到, 跳过请求.`)
        $done()
    }
}

main()
