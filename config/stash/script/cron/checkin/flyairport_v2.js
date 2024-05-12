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
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${year}-${month}-${day} ${hours}:${minutes}`
}

function ifRequest(){
    let today = getLocalDateString(new Date())
    let key = `${$script.name}-${today}`
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
    if (ifRequest()){
        url = "https://proxy-tool.19940731.xyz/api/api/checkin/flyairport/v2"
        $httpClient.post({url: url, headers: {"content-type":"application/json"}, body: JSON.stringify(payload)}, (error, _, data)=>{
            if(error){
                console.log(`请求失败 ${error}`)
                $notification.post($script.name, "签到失败", error)
            }else{
                let body = JSON.parse(data)
                console.log(`签到完成, ${body['msg']}`)
                $notification.post($script.name, "签到成功", `${body['msg']}`)
                let key = `${$script.name}-${today}`
                let today = getLocalDateString(new Date())
                $persistentStore.write(today, key)
            }
            $done()
        })
    }else{
        console.log(`今日已签到, 跳过请求.`)
        $done()
    }
}

main()
