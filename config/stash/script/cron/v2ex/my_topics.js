/*
sessionKey
barkToken
isAlwaysPub
{"isAlwaysPub":false, "barkToken":"","sessionKey":""}
*/

/**
 * 解析 json 字符串， 失败返回 null
 * @param {*} string 
 * @returns 
 */
function parseJsonBody(string) {
    try {
        return JSON.parse(string)
    } catch (e) {
        return null
    }
}


function getPersistentKey(tid) {
    return `${$script.name}-${tid}`
}
const printObj = function (body) {
    for (const key in body) {
        console.log(`    ==> Key: ${key}, Value: ${body[key]}`);
    }
}

function getBodyArgument(key) {
    if (typeof $argument === "undefined") {
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key]
}

const getBarkToken = function () {
    return getBodyArgument("barkToken")
}

function ifPush(tid, last_touched) {
    if (getBodyArgument("isAlwaysPub")) {
        return true
    }
    key = getPersistentKey(tid)
    let lastPub = $persistentStore.read(key)
    console.log(`tid: ${tid}, lastPub: ${lastPub}`)
    if (!lastPub) {
        return true
    }
    // 接口返回的是秒级时间戳
    if ((new Date(lastPub).getTime()) < (last_touched * 1000)) {
        return true
    }
    return false
}

function makeMessages(topics) {
    // https://p.19940731.xyz/redoc#tag/notifications.push
    // https://p.19940731.xyz/redoc#tag/v2ex.my/operation/my_topics_api_v2ex_my_topics_get
    let messages = []
    let device_key = getBarkToken()
    topics.forEach(element => {
        let m = {
            "bark": {
                "device_key": device_key,
                "title": `V2ex 收藏的帖子有新的回复`,
                "body": `${element["title"]}\n最新回复: ${element["lastTouchedStr"]}`,
                "icon": "https://v2ex.com/favicon.ico",
                "url": `v2fun://topic/${element["id"]}`,
                "group": "v2ex-favorite-topics",
                "level": "passive"
            }
        }
        messages.push(m)
    })
    return messages
}

function main() {
    let sessionKey = getBodyArgument("sessionKey")
    if (!sessionKey) {
        $done({})
        console.log(`sessionKey is not exists.`)
        return
    }
    let url = "https://p.19940731.xyz/api/v2ex/my/topics"
    $httpClient.get({ url: url, headers: { "content-type": "application/json", "A2": sessionKey } }, (error, response, data) => {
        if (error) {
            $done({})
            console.log(error)
            return
        }

        let resp = parseJsonBody(data)
        if (resp === null) {
            $done({})
            console.log(`get topics error: ${data}`)
            console.log(`请检查 sessionKey 是否过期.`)
            return
        }
        let topics = []
        resp['topics'].forEach(element => {
            if (ifPush(element['id'], element["last_touched"])) {
                topics.push(element)
            }
        });
        let messages = makeMessages(topics)
        // 构建 messages        
        if (messages.length === 0) {
            $done({})
            console.log(`未发现收藏的主题有新的回复`)
            return
        }
        console.log(`发现${messages.length}个主题有新回复`)
        let payload = JSON.stringify({ messages: messages })
        let url = "https://p.19940731.xyz/api/notifications/push"
        $httpClient.post({ url: url, headers: { "content-type": "application/json" }, body: payload }, (error, response, data) => {
            if (error) {
                console.log(`推送消息失败: ${error}`)
                $done({})
                return
            }
            let current = new Date().toString()
            topics.forEach(element => {
                key = getPersistentKey(element['id'])
                $persistentStore.write(current, key)
            })
            $done({})
        })
    })
}
try {
    main()
} catch (error) {
    console.log(`error: ${error}`)
    $done({})
}
