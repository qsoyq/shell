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

console.log(`script.name: ${$script.name}`)
console.log(`$argument: ${$argument}`)    
printObj($environment)

let lastRunAt = $persistentStore.read("lastRunAt")
if (lastRunAt !== undefined){
    console.log(`lastRunAt: ${lastRunAt}`)
}
const now = new Date().toString()
$persistentStore.write(now, "lastRunAt")

const headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
}

const isRoomAlive = function(roomId){
    return false
}

const getRoomList = function(argument){
    if(!argument){
        return []
    }
    let body = JSON.parse(argument)
    t = typeof body.rooms
    printObj(body)
    let rooms = body.rooms
    return rooms ? rooms.split(","): []
}

const getBarkToken = function(argument){
    if(!argument){
        return ""
    }
    let body = JSON.parse(argument)    
    return body["barkToken"]
}

const getRoomInfo = function(data){
    let body = JSON.parse(data)
    return body.data
}

const handler = function(roomId, ctx){
    let lastPubKey = `BilibiliWatcherlastPub${roomId}`
    let liveRoomLink = `https://live.bilibili.com/${roomId}`
    $httpClient.get({
        "url": `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomId}&from=room`,
        "headers": headers
    }, (error, response, data) => {
      if (error) {
        ctx.reject(error)
      } else {
        let body = JSON.parse(data)
        let roomInfo = body.data

        // 判断直播状态和上次推送时间
        let liveTime = new Date(roomInfo.liveTime).getTime()
        let isAlive = roomInfo.live_status === 1
        if (!isAlive){
            ctx.resolve(`直播间 ${roomId} 未开播`)
            return
        }

        let current = new Date().getTime()
        let lastPub = $persistentStore.read(lastPubKey)
        if (lastPub && 0){
            if(lastPub >= current){
                ctx.resolve(`${roomId} 已在 ${lastPub} 推送过`)
                return 
            }
        }
        let headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Referer": `https://live.bilibili.com/${roomId}`
        }        
        $httpClient.get({
            "url": `https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room?roomid=${roomId}`,
            "headers": headers
        }, (error, response, data) => {
          if (error) {
            ctx.reject(error)
          } else {  
            let body = JSON.parse(data).data.info
            let anchor = {
                uid: body.uid,
                uname: body.uname,
                face: body.face  // 
            }
            // 推送
            $notification.post("bilibiliRoomLiveWatcher", `${anchor.uname}`, `${roomInfo.title}\n\n${liveRoomLink}`)
            console.log(`ctx.resolve: ${ctx.resolve}`)
            ctx.resolve(`${anchor.uname} ${roomId} 已开播`)
            console.log(`${anchor.uname}, ${anchor.face}, ${liveRoomLink}, ${roomInfo.title}`)
          }
        })        
      }
    })
}

const barkToken = getBarkToken($argument)
const roomList = getRoomList($argument)
let promiseList = []
console.log(`roomList: ${roomList}`)
console.log(`barkToken: ${barkToken}`)

roomList.forEach((roomId)=>{
    task = new Promise((resolve, reject) => {
        handler(roomId, {resolve: resolve, reject: reject})
    });
    promiseList.push(task)    
    console.log(`new task for room: ${roomId}`)
})

const allPromise = Promise.all(promiseList);

allPromise
.then((results) => {
  console.log(`run successed: ${results}`)
  $done({})
})
.catch((error) => {
    console.error(`run failed: ${error}`); // 输出："失败！"
    $done({})
})
