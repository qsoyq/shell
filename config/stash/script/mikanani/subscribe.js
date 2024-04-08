const lastPubKey = `${$script.name}lastPub`
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

function handler(item, callback){
    let resolve = callback['resolve']
    let reject = callback['reject']
    let barkToken = getBarkToken()

    let apiUrl = "https://api.day.app/push" 
    let url = "https://mikanani.me/"
    let group = "Mikanani"
    let level = "passive"
    let copyContent = url
    let icon = "https://mikanani.me/favicon.ico"

    let title = item["title"]
    let body = item["title"]

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
            resolve("item resolved")
        }
    })     

}
const callback = {
    then: function(results){
        // TODO: 优化推送逻辑， 解决当部分推送成功时再次执行可能导致重复推送的问题
        let current = new Date().getTime()
        console.log(`执行结束: ${new Date()}`)
        $persistentStore.write(current.toString(), lastPubKey)
        $done({})
    },
    catch: function(errors){
        errors.forEach(error=>{
            console.log(`${error}`)
        })
        let current = new Date().getTime()
        console.log(`执行结束: ${new Date()}`)
        $done({})
    }
}

function main(){
    // let url = "https://mikanani.me/RSS/MyBangumi?token={token}"
    let barkToken = getBarkToken()
    if (!barkToken){
        console.log("bark token 未定义")
        $done({})
        return
    }
    let url = getBodyArgument("url")
    if (!url){
        console.log("url 未定义")
        $done({})
        return
    }    
    
    let isAlwaysPub = getBodyArgument("isAlwaysPub")
    $httpClient.get(url, (err, _, xmlBody) => {
        if(err){
            console.log(`请求 mikan 订阅失败: ${err}`)
            $done({})
            return
        }
        url = "https://proxy-tool.19940731.xyz/api/convert/xml/json"
        let payload = JSON.stringify({content: xmlBody})

        $httpClient.post({url: url, headers: {"content-type": "application/json"}, body: payload}, (error, response, data)=>{
            if(error){
                console.log(`xml 转 json 请求失败: ${error}, status: ${response.status}`)
                $done({})
                return
            }
            
            let body = JSON.parse(JSON.parse(data)['content'])
            // 过滤 items, 筛选需要推送的对象
            let lastPubDate = $persistentStore.read(lastPubKey)
            let items = []
            body['rss']['channel']['item'].forEach(element=>{
                if (isAlwaysPub || (!lastPubDate) || (Number(lastPubDate) < (new Date(element['torrent']['pubDate']).getTime()) )){
                    items.push(element)
                }
            })
            if (items.length==0){
                $done({})
                return 
            }

            gather(items, handler, callback)
        })
    })
}
main()
