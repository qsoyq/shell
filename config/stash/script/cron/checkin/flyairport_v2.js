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
    url = "https://proxy-tool.19940731.xyz/api/api/checkin/flyairport/v2"
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
