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
    return `${year}-${month}-${day} ${hours}`
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

function handler(thread, callback){
    console.log(`处理帖子 tid: ${thread["tid"]}, subject: ${thread["subject"]}, group: ${thread["_group"]}`)
    let resolve = callback['resolve']
    let reject = callback['reject']
    let barkToken = getBarkToken()

    let apiUrl = "https://api.day.app/push" 
    // let url = thread["ios_open_scheme_url"]
    let url = thread["ios_app_scheme_url"]
    
    let level = getBodyArgument("level") ? getBodyArgument("level") : "active"
    let copyContent = url
    let icon = ""
    let name = ""

    if (typeof thread["fname"] !== "undefined"){
        name = thread['fname']
    }else{
        name = getBodyArgument("name") ? getBodyArgument("name") : ""
    } 
    
    if (typeof thread["icon"] !== "undefined"){
        icon = thread['icon']
    }    
    
    let title = `NGA ${name}有新帖子发布了`
    let group = "NGA"

    if (typeof thread["_group"] !== "undefined"){
        group = thread['_group']
    }


    let body = `${thread["subject"]}\nurl:${thread["url"]}\n${thread["ios_app_scheme_url"]}`



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
            let lastPubKey = `${$script.name}lastPub${thread["tid"]}`
            resolve(lastPubKey)
        }
    })     
}

const callback = {
    then: function(results){
        // TODO: 优化推送逻辑， 解决当部分推送成功时再次执行可能导致重复推送的问题

        results.forEach(lastPubKey=>{
            console.log(`执行结束: ${new Date()}`)
            let current = new Date().getTime()
            $persistentStore.write(current.toString(), lastPubKey)
        })

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

    let fid = getBodyArgument("fid")
    if (!fid){
        console.log("fid 未定义")
        $done({})
        return
    }

    let cid = getBodyArgument("cid")
    if (!cid){
        console.log("cid 未定义")
        $done({})
        return
    }

    let uid = getBodyArgument("uid")
    if (!uid){
        console.log("uid 未定义")
        $done({})
        return
    }
    
    let name = getBodyArgument("name")
    if (!name){
        console.log("name 未定义")
        $done({})
        return
    }    
    
    let isAlwaysPub = getBodyArgument("isAlwaysPub")
    let url = `https://proxy-tool.19940731.xyz/api/nga/threads?fid=${fid}&order_by=lastpostdesc`
    $httpClient.get({url: url, headers: {"content-type": "application/json", "uid": uid, "cid": cid}}, (error, response, data)=>{
        if(error){
            console.log(`获取 nga 帖子失败: ${error}, status: ${response.status}`)
            $done({})
            return
        }
        
        let body = JSON.parse(data)
        let threads = []

        let group = ''
        let groupBy = getBodyArgument("groupBy")
        if (typeof groupBy === 'string' && groupBy === 'name'){
            let name = getBodyArgument('name')
            if(name){
                group = `NGA-${name}`
            }
        }else{
            group = randomChar(16) // 用于标记本次推送的分组
        }        

        body['threads'].forEach(t=>{
            let lastPubKey = `${$script.name}lastPub${t["tid"]}`
            let lastPubDate = $persistentStore.read(lastPubKey)
            t['_group'] = group
            if (isAlwaysPub || (!lastPubDate)){
                threads.push(t)
            }
        })
        
        if (threads.length==0){
            console.log("没有需要关注的新帖子")
            $done({})
            return 
        }
        console.log(`共发现${threads.length}条新帖子`)

        gather(threads, handler, callback)
    })    
}
main()
