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
    return body[key]
}

const getBarkToken = function(){
    return getBodyArgument("barkToken")
}

function gather(items, handler, callback){
    let promiseList = []
    items.forEach(element => {
        task = new Promise((resolve, reject) => {
            handler(element, {resolve: resolve, reject: reject})
        });        
        promiseList.push(task)
    });    
    const allPromise = Promise.all(promiseList);

    allPromise
    .then((results) => { 
        callback["then"](results)
    })
    .catch((errors) => {
        callback["catch"](errors)
    })
}

function handler(topic, callback){
    console.log(`处理主题 id: ${topic["id"]}, subject: ${topic["title"]}`)
    let resolve = callback['resolve']
    let reject = callback['reject']
    let barkToken = getBarkToken()

    let apiUrl = "https://api.day.app/push" 
    let url = topic["url"]
    let level = getBodyArgument("level") ? getBodyArgument("level") : "active"
    let copyContent = url
    let icon = topic["node"]["avatar"]
    let nodeName = topic["node"]["title"]
    let title = `V2ex ${nodeName} 有新帖子`
    let group = `V2ex-Node-${nodeName}`
    let body = `${topic["title"]}\n创建${topic["createdStr"]}\n回复:${topic["lastTouchedStr"]}\nurl:${url}`
    let payload = {
        title: title,
        body: body,
        group: group,
        isArchive: "1",
        copy: copyContent,
        url: url,
        icon: icon,
        device_key: barkToken,
        automaticallyCopy: "1",
        level: level
    }     
    payload = JSON.stringify(payload)       
    $httpClient.post({
        url: apiUrl,
        headers: {"content-type": "application/json"},
        body: payload
    }, (error, response, data)=>{
        if(error){
            reject(error)
        }else{
            let lastPubKey = `${$script.name}lastPub${topic["id"]}`
            let current = new Date().getTime()
            $persistentStore.write(current.toString(), lastPubKey)
            resolve(`${topic["title"]} 推送成功`)
        }
    })     
}

const callback = {
    then: function(results){
        // TODO: 优化推送逻辑， 解决当部分推送成功时再次执行可能导致重复推送的问题
        console.log(`执行结束: ${new Date()}`)
        $done({})
    },
    catch: function(errors){
        errors.forEach(error=>{
            console.log(`${error}`)
        })
        console.log(`执行结束: ${new Date()}`)
        $done({})
    }
}


function main(){
    let barkToken = getBarkToken()
    if (!barkToken){
        console.log("bark token 未定义")
        $done({})
        return
    }

    let token = getBodyArgument("token")
    if (!token){
        console.log("token 未定义")
        $done({})
        return
    }

    let node = getBodyArgument("node")
    if (!node){
        console.log("node 未定义")
        $done({})
        return
    }    

    let isAlwaysPub = getBodyArgument("isAlwaysPub")
    let url = `https://proxy-tool.19940731.xyz/api/v2ex/nodes/${node}/topics`
    $httpClient.get({url: url, headers: {"content-type": "application/json", "Authorization": token}}, (error, response, data)=>{
        if(error){
            console.log(`获取 v2ex 主题: ${error}, status: ${response.status}`)
            $done({})
            return
        }
        
        let body = JSON.parse(data)
        let topics = []

        body['topics'].forEach(t=>{
            let lastPubKey = `${$script.name}lastPub${t["id"]}`
            let lastPubDate = $persistentStore.read(lastPubKey)
            if (isAlwaysPub || (!lastPubDate)){
                t["node"] = body["node"]
                topics.push(t)
            }
        })
        
        if (topics.length==0){
            console.log("没有需要关注的新主题")
            $done({})
            return 
        }
        console.log(`共发现${topics.length}条新主题`)

        gather(topics, handler, callback)
    })    
}
main()
