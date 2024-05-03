function getLocalDateString(date){
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${year}-${month}-${day} ${hours}:${minutes}`
}

function getBodyArgument(key){
    if (typeof $argument === "undefined"){
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key]
}

function main(){
    let object = {}
    let key = getBodyArgument("key")
    if(!key){
        console.log(`key 未定义`)
        $done(object)
        return 
    }
    let url = `https://proxy-tool.19940731.xyz/api/store/memory/${key}`
    $httpClient.get(url, (error, response, data)=> {
        if(error){
            console.log(`获取设备信息失败, ${error}`)
        }else{
            let body = JSON.parse(data)
            if (body["state"]["content"]){
                let updated = getLocalDateString(new Date(body["state"]["updated"] * 1000))
                let content = `电量: ${body["state"]["content"]["battery"]}\n系统: ${body["state"]["content"]["system"]}\n更新时间: ${updated}`
                object["title"] = `${body["state"]["content"]["hostname"]}`
                object["content"] = content
            }
        }
        $done(object)
    })    
}

main()
