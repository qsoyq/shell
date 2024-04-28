/*
相对 v1， 将多次 bark push 合并为一次
{"nodeList":[],"barkToken":"","isAlwaysPub":false,"token":""}
*/

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

function getBodyArgument(key){
    if (typeof $argument === "undefined"){
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key]
}

function ifPush(topic){
    let isAlwaysPub = getBodyArgument("isAlwaysPub")
    let key = getPersistentKey(topic["id"])
    let lastReplies = $persistentStore.read(key)
    let topicReplies = topic['replies']
    // console.log(`debug ${lastReplies}, ${topicReplies}`)
    if (isAlwaysPub || (typeof lastReplies === "undefined")){
        return true
    }
    return false
}

function getPersistentKey(tid){
    return `${$script.name}-${tid}`
}

function makeMessages(items){
    let device_key = getBodyArgument("barkToken")
    let messages = []
    for(let i=0;i<items.length;i++){
        let topic = items[i]
        let payload = {
            device_key: device_key,
            title: `V2ex ${topic["node"]["title"]} 有新帖子`,
            body: `${topic["title"]}\n回复数:${topic["replies"]}\n创建${topic["createdStr"]}\n回复时间:${topic["lastTouchedStr"]}\nurl:${topic["url"]}`,
            level: "passive",
            group: `V2ex-Node-${topic["node"]["title"]}`,
            url: typeof topic["v2fun_urlscheme"] !== 'undefined' ? topic["v2fun_urlscheme"] : topic["url"],
            icon: topic["node"]["avatar"]
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

    let nodeList = getBodyArgument("nodeList")
    if (!nodeList){
        console.log("nodeList 未定义")
        $done({})
        return
    }
    let token = getBodyArgument("token")
    if (!token){
        console.log("token 未定义")
        $done({})
        return
    }

    let querystringArray = []
    nodeList.forEach(element=>{
        querystringArray.push(`node=${element}`)
    })
    let qs = querystringArray.join("&")
    let url = `https://proxy-tool.19940731.xyz/api/v2ex/topics?${qs}`

    $httpClient.get({url: url, headers: {"content-type": "application/json", "Authorization": token}}, (error, response, data)=>{
        if(error){
            console.log(`获取 v2ex 主题失败: ${error}, status: ${response.status}`)
            $done({})
            return
        }
        
        let body = JSON.parse(data)
        // 过滤 items, 筛选需要推送的对象
        let items = []
        body["data"].forEach(element=>{
            element['topics'].forEach(topic=>{
                topic["node"] = element["node"]
                if(ifPush(topic)){
                    items.push(topic)
                }
            })
        })

        if (items.length==0){
            console.log("暂无新内容")
            $done({})
            return 
        }

        console.log(`共有 ${items.length} 条新内容`)
        let messages = makeMessages(items)
        let payload = JSON.stringify({"messages": messages})
        let url = "https://proxy-tool.19940731.xyz/api/notifications/push"
        // console.log(`payload: ${payload}`)
        // push
        $httpClient.post({url: url, headers: {"content-type": "application/json"}, body: payload}, (error, response, data)=>{
            if (error){
                console.log(`推送消息失败: ${error}`)
                $done({})
                return 
            }

            items.forEach(topic=>{
                let key = getPersistentKey(topic["id"])
                $persistentStore.write(String(topic["replies"]), key)
            })
            
            $done({})
        })        
    })    
}
main()
