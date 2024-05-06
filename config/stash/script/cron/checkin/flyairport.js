function getBodyArgument(key){
    if (typeof $argument === "undefined"){
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key]
}

function main(){
    let email = getBodyArgument("email")
    if(!email){
        console.log("email undefined")
        $done()
        return
    }

    let key = getBodyArgument("key")
    if(!key){
        console.log("key undefined")
        $done()
        return
    }
    
    let expire_in = getBodyArgument("expire_in")
    if(!expire_in){
        console.log("expire_in undefined")
        $done()
        return
    }
    
    let uid = getBodyArgument("uid")
    if(!uid){
        console.log("uid undefined")
        $done()
        return
    }

    let current = new Date().getTime() / 1000
    if (current >= Number(expire_in)){
        console.log("cookie 已过期, 请更新参数")
        $notification.post($script.name, "签到失败", "cookie 已过期, 请更新参数")
        $done()
        return
    }

    let payload = {
        email: email,
        key: key,
        expire_in: expire_in,
        uid: uid
    }
    url = "https://proxy-tool.19940731.xyz/api/api/checkin/flyairport/"
    $httpClient.post({url: url, headers: {"content-type":"application/json"}, body: JSON.stringify(payload)}, (error, _, data)=>{
        if(error){
            console.log(`请求失败 ${error}`)
            $notification.post($script.name, "签到失败", error)
        }else{
            let body = JSON.parse(data)
            console.log(`签到完成, ${body['msg']}`)
        }
        $done()
    })
}

main()
