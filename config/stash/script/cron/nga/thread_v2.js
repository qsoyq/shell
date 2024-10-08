/*
相对 v1， 将多次 bark push 合并为一次
{"groupBy":"name","barkToken":"","isAlwaysPub":false,"fidList":[],"uid":"","cid":""}

2024-09-22: 支持 `groupLabel`参数
*/
function randomChar(num) {
    const min = 65; // 'A' 的 ASCII 码
    const max = 90; // 'Z' 的 ASCII 码
    let chars = []
    for (let i = 0; i < num; i++) {
        let char = String.fromCharCode(Math.floor(Math.random() * (max - min + 1)) + min)
        chars.push(char)
    }

    return chars.join("")
}

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

function getBodyArgument(key) {
    if (typeof $argument === "undefined") {
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key]
}

function ifPush(element) {
    let isAlwaysPub = getBodyArgument("isAlwaysPub")
    let key = getPersistentKey(element["tid"])
    let lastPubDate = $persistentStore.read(key)
    let threadLastPost = element['lastpost']
    // console.log(`debug: ${element["subject"]} ${lastPubDate} ${threadLastPost}`)
    if (isAlwaysPub || (!lastPubDate)) {
        return true
    }
    return false
}

function getPersistentKey(tid) {
    return `${$script.name}-${tid}`
}

function makeMessages(items) {
    let device_key = getBodyArgument("barkToken")
    let groupBy = getBodyArgument("groupBy")
    let group = randomChar(16)
    let barkEndpoint = getBodyArgument("barkEndpoint")
    let messages = []
    let groupLabel = getBodyArgument('groupLabel')
    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        if (typeof groupBy !== 'undefined' && groupBy === 'name') {
            group = `NGA-${item['fname']}`
        }

        if (groupLabel) {
            group = groupLabel
        }

        let payload = {
            device_key: device_key,
            title: `NGA ${item["fname"]} 有新帖子发布了`,
            body: `${item["subject"]}\n创建时间:${item["postdateStr"]}\n回复时间:${item["lastpostStr"]}\nurl:${item["url"]}\n${item["ios_app_scheme_url"]}`,
            level: "passive",
            group: group,
            url: `${item["ios_app_scheme_url"]}`,
            icon: typeof item["icon"] !== "undefined" ? item["icon"] : "",
        }
        if (barkEndpoint) {
            payload["endpoint"] = barkEndpoint
        }
        messages.push({ "bark": payload })
    }
    return messages
}

function main() {
    let barkToken = getBodyArgument("barkToken")
    if (!barkToken) {
        console.log("bark token 未定义")
        $done({})
        return
    }

    let fidList = getBodyArgument("fidList")
    if (!fidList) {
        console.log("fidList 未定义")
        $done({})
        return
    }
    let uid = getBodyArgument("uid")
    if (!uid) {
        console.log("uid 未定义")
        $done({})
        return
    }
    let cid = getBodyArgument("cid")
    if (!cid) {
        console.log("cid 未定义")
        $done({})
        return
    }

    let querystringArray = []
    fidList.forEach(element => {
        querystringArray.push(`fid=${element}`)
    })
    querystringArray.push(`order_by=lastpostdesc`)
    let qs = querystringArray.join("&")
    let url = `https://p.19940731.xyz/api/nga/threads/v2?${qs}`

    $httpClient.get({ url: url, headers: { "content-type": "application/json", "uid": uid, "cid": cid } }, (error, response, data) => {
        if (error) {
            console.log(`获取 nga 分区帖子失败: ${error}, status: ${response.status}`)
            $done({})
            return
        }

        let body = parseJsonBody(data)
        if (body === null) {
            console.log(`invalid json body: ${data}`)
            $done({})
            return
        }
        // 过滤 items, 筛选需要推送的对象
        let items = []
        body["data"].forEach(element => {
            element['threads'].forEach(thread => {
                if (ifPush(thread)) {
                    items.push(thread)
                }
            })
        })

        if (items.length == 0) {
            console.log("暂无新内容")
            $done({})
            return
        }

        console.log(`共有 ${items.length} 条新内容`)
        let messages = makeMessages(items)
        let payload = JSON.stringify({ "messages": messages })
        let url = "https://p.19940731.xyz/api/notifications/push"
        // console.log(`payload: ${payload}`)
        // push
        $httpClient.post({ url: url, headers: { "content-type": "application/json" }, body: payload }, (error, response, data) => {
            if (error) {
                console.log(`推送消息失败: ${error}`)
                $done({})
                return
            }
            let current = new Date().toString()
            items.forEach(thread => {
                let key = getPersistentKey(thread["tid"])
                $persistentStore.write(current, key)
            })

            $done({})
        })
    })
}
try {
    main()
} catch (e) {
    console.log(`exception: ${e}`)
    $done({})
}

