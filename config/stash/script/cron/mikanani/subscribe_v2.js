/*
相对 v1， 将多次 bark push 合并为一次
{"barkToken":"","isAlwaysPub":false,"mikananiToken":""}
*/

function getBodyArgument(key){
    if (typeof $argument === "undefined"){
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key]
}

function ifPush(element){
    let isAlwaysPub = getBodyArgument("isAlwaysPub")
    let key = getPersistentKey()
    let lastPubDate = $persistentStore.read(key)
    if (isAlwaysPub || (!lastPubDate) || (new Date(lastPubDate).getTime() < (new Date(element['torrent']['pubDate']).getTime()) )){
        return true
    }
    return false
}

function getPersistentKey(){
    return `${$script.name}-mikanani-subscribe-v2`
}

function makeMessages(items){
    let device_key = getBodyArgument("barkToken")
    let messages = []
    for(let i=0;i<items.length;i++){
        let item = items[i]
        let payload = {
            device_key: device_key,
            title: item["title"],
            body: item["title"],
            level: "active",
            group: "Mikanani",
            url: "https://mikanani.me/",
            icon: typeof item["image"] !== "undefined"? item["image"] : "https://mikanani.me/favicon.ico",
        }   
        messages.push({"bark": payload})
    }
    return messages  
}

function main(){
    let barkToken = getBodyArgument("barkToken")
    if (!barkToken){
        console.log("bark token 未定义")
        $done({})
        return
    }

    let mikananiToken = getBodyArgument("mikananiToken")
    if (!mikananiToken){
        console.log("mikanani token 未定义")
        $done({})
        return
    }    
    
    let url = `https://p.19940731.xyz/api/mikanani/rss/?token=${mikananiToken}`

    $httpClient.get({url: url, headers: {"content-type": "application/json"}}, (error, response, data)=>{
        if(error){
            console.log(`获取 mikanani rss 订阅失败: ${error}, status: ${response.status}`)
            $done({})
            return
        }
        
        let body = JSON.parse(data)
        // 过滤 items, 筛选需要推送的对象
        let items = []
        body['rss']['channel']['item'].forEach(element=>{
            if(ifPush(element)){
                items.push(element)
            }
        })
        if (items.length==0){
            console.log("暂无番剧更新")
            $done({})
            return 
        }
        console.log(`共有 ${items.length} 部番剧更新`)
        let messages = makeMessages(items)
        let payload = JSON.stringify({"messages": messages})
        let url = "https://p.19940731.xyz/api/notifications/push"
        console.log(`payload: ${payload}`)
        // push
        $httpClient.post({url: url, headers: {"content-type": "application/json"}, body: payload}, (error, response, data)=>{
            if (error){
                console.log(`推送消息失败: ${error}`)
                $done({})
                return 
            }
            let current = new Date().toString()
            let key = getPersistentKey()
            $persistentStore.write(current, key)
            $done({})
        })        
    })    
}
main()
