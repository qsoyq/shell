/*
rooms 代表要订阅的直播间
barkToken 为对应的推送令牌
argument:
    {\"rooms\":\"1,2,3,4\",\"barkToken\":\"123456\"}
*/
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

function removeHtmlTags(text) {
    // 定义一个正则表达式，用于匹配 HTML 标签
    const htmlTagsRe = /<[^>]+>/g;
    // 使用 replace 方法替换 HTML 标签，保留 title 里的字符串
    return text.replace(htmlTagsRe, (match) => {
      const title = match.match(/title\s*=\s*"(.*?)"/);
      return title ? title[1] : "";
    });
}
  
function unescapeHtml(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc.body.textContent;
}
    
const getRoomList = function(){
    let rooms = getBodyArgument("rooms")
    return rooms ? rooms.split(","): []
}

const getBarkToken = function(){
    return getBodyArgument("barkToken")
}

const isDebug = Boolean(getBodyArgument("debug"))


const isAlwaysPub = getBodyArgument("isAlwaysPub")

function handler(roomId, ctx){
    let lastPubKey = `${$script.name}lastPub${roomId}`
    let liveRoomLink = `https://live.bilibili.com/${roomId}`
    let url = `https://proxy-tool.19940731.xyz/api/bilibili/live/room/${roomId}`

    $httpClient.get(url, (error, response, data) => {
        if (error) {
            console.error(`获取直播间信息失败, 房间号: ${roomId}, reason: ${error}`)
            ctx.reject(error)
            return
        }
        let body = JSON.parse(data)
        let roomInfo = body.roomInfo
        let anchor = {
            uid: body.userInfo.uid,
            uname: body.userInfo.uname,
            face: body.userInfo.face
        }
        let isAlive = body.isAlive

        // 判断直播状态和上次推送时间
        let liveTime = new Date(roomInfo.live_time).getTime()

        if (!isAlive){
            ctx.resolve(`${anchor.uname}的直播间${roomId}未开播`)
            return
        }

        let current = new Date().getTime()
        let lastPub = $persistentStore.read(lastPubKey)

        if (lastPub){
            lastPub = Number(lastPub)
            if(isDebug){
                console.log(`${anchor.uname} - lastPub: ${new Date(lastPub)}, liveTime: ${new Date(liveTime)}, current: ${new Date(current)}`)
            }                
            if(lastPub >= liveTime && !isAlwaysPub){
                ctx.resolve(`${anchor.uname}的直播间已在 ${new Date(lastPub)} 推送过`)
                return
            }
        }
        // 推送   
        const pushToStash = ()=>{
            if(isDebug){
                console.log(`${anchor.uname}\n${anchor.face}\n${roomInfo.title}\n\n${roomInfo.live_time}\n\n${liveRoomLink}`)
            }                
            $notification.post("bilibiliRoomLiveWatcher", `${anchor.uname}`, `${roomInfo.title}\n${roomInfo.live_time}\n${liveRoomLink}`,{url: liveRoomLink})
            ctx.resolve(`${anchor.uname} ${roomId} 已开播`)
            $persistentStore.write(current.toString(), lastPubKey)
        }

        const pushToBark = function(){
            let barkToken = getBarkToken()
            let description = removeHtmlTags(unescapeHtml(roomInfo.description))
            let openLiveRoom = `bilibili://live/${roomId}`
            let body =  `${roomInfo.title}\n${roomInfo.live_time}\n${description}`
            body = body.substring(0, 1024)
            let payload = {
                title: `${anchor.uname}`,
                body: `${roomInfo.title}\n${description}\n${roomInfo.live_time}`,
                group: "BilibiliLive",
                isArchive: "1",
                copy: liveRoomLink,
                url: openLiveRoom,
                icon: anchor.face,
                device_key: barkToken,
                automaticallyCopy: "1"
            }     
            payload = JSON.stringify(payload)       
            $httpClient.post({
                url: "https://api.day.app/push",
                headers: {"content-type": "application/json"},
                body: payload
            }, (error, response, data)=>{
                if(isDebug){
                    console.log(`为${anchor.uname}发送 bark 推送\nerror: ${error}\ndata:${data}`)
                }
                if(error || Number(response['status']) >= 300){
                    console.log(`推送消息失败， status: ${response['status']}, error: ${error}`)
                    ctx.reject(error)
                }else{
                    ctx.resolve(`${anchor.uname} ${roomId} 已开播`)
                    $persistentStore.write(current.toString(), lastPubKey)
                }

            })
        }     
        if(getBodyArgument("isPushToBark")){
            pushToBark()    
        }
        if(getBodyArgument("isPushToStash")){
            pushToStash()
        }
    })
}

function main(){
    if(isDebug){
        printObj($environment)
    
        let lastRunAtKey = `${$script.name}LastRunAt`
        let lastRunAt = $persistentStore.read(lastRunAtKey)
        if (lastRunAt !== undefined){
            console.log(`lastRunAt: ${lastRunAt}`)
        }
        const now = new Date().toString()
        $persistentStore.write(now, lastRunAtKey)
    }
    
    if ($environment.system !== "iOS"){
        $done({})
    }else{
        const roomList = getRoomList()
        console.log(`isAlwaysPub func: ${isAlwaysPub}`)
        let promiseList = []
        if(isDebug){
            let barkToken = getBarkToken()
            console.log(`roomList: ${roomList}`)
            console.log(`barkToken: ${barkToken}`)
        }
        
        roomList.forEach((roomId)=>{
            task = new Promise((resolve, reject) => {
                handler(roomId, {resolve: resolve, reject: reject})
            });
            promiseList.push(task)    
        })
        
        const allPromise = Promise.all(promiseList);
        
        allPromise
        .then((results) => { 
            console.log(`run successed`)
            results.forEach((resolve)=>{
                // console.log(resolve)
            })
            $done({})
        })
        .catch((error) => {
            console.error(`run failed`); // 输出："失败！"
            error.forEach((reject)=>{
                // console.log(reject)
            })
            $done({})
        })
    }
}

main()
