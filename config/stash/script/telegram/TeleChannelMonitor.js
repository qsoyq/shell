/**
 * 对异步回调的 http 调用包装成 async 函数
 * @param {string} method 
 * @param {object} params 请求参数
 * @returns {object} 包含 error, response, data 的对象
 */
async function request(method, params) {
    return new Promise((resolve, reject) => {
        $httpClient[method.toLowerCase()](params, (error, response, data) => {
            if (error) {
                console.error(`Error: ${error}, Response: ${JSON.stringify(response)}, Data: ${data}`);
                reject({ error, response, data });
            } else {
                resolve({ error, response, data });
            }
        });
    });
}

/**
 * 请求封装
 * @param {object} params 请求参数
 * @returns {object} 包含 error, response, data 的对象
 */
async function get(params) {
    return request('GET', params);
}

/**
 * 请求封装
 * @param {object} params 请求参数
 * @returns {object} 包含 error, response, data 的对象
 */
async function post(params) {
    return request('POST', params);
}

/**
 * 请求封装
 * @param {object} params 请求参数
 * @returns {object} 包含 error, response, data 的对象
 */
async function put(params) {
    return request('PUT', params);
}

/**
 * 请求封装
 * @param {object} params 请求参数
 * @returns {object} 包含 error, response, data 的对象
 */
async function delete_(params) {
    return request('DELETE', params);
}

/**
 * 解析 cookies 字符串并返回对象
 * @param {string} cookie 
 * @returns {object|null} 当返回为 null 表示解析失败
 */
function parseCookie(cookie) {
    if (typeof (cookie) !== "string") {
        console.log(`illegally cookie: ${cookie}`)
        return null
    }
    let body = {}
    cookie.split(";").forEach(element => {
        if (element) {
            // let arr = element.trim().split("=")
            element = element.trim()
            let index = element.indexOf("=")
            if (index === -1) {
                console.log(`illegally cookie field: ${element}`)
                return null
            } else {
                let key = element.substring(0, index)
                let value = element.substring(index + 1)
                body[key] = value
            }
        }
    })
    return body
}
/**
 * 读取 stash 内部持久化存储的值
 * @param {string} key 
 */
function read(key) {
    $persistentStore.read(key)
}

/**
 * 更新 stash 内部持久化的值
 * @param {string} key 
 * @param {string} val 
 */
function writePersistentArgument(key, val) {
    $persistentStore.write(val, key)
}

/**
 *  基于持久化读取 Cookie
 * @param {string} key 
 * @returns {string}
 */
function getCookie(key) {
    return $persistentStore.read(`Cookie.${key}`)
}

/**
 * 基于持久化写入 Cookie
 * @param {string} key 
 * @param {string} val 
 * @returns 
 */
function setCookie(key, val) {
    return $persistentStore.write(val, `Cookie.${key}`)
}
/**
 * 发送 stash 通知
 * @param {string} title 
 * @param {string} subtitle 
 * @param {string} content 
 * @param {string|undefined} url 
 */
function notificationPost(title, subtitle, content, url) {
    const params = url ? { url } : {};
    $notification.post(title, subtitle, content, params)
}

/**
 * 判断当前请求是否来自微信
 * @returns {bool} 
 */
function isWechat() {
    if (typeof $request === 'undefined') {
        return false
    }
    let ua = $request.headers["User-Agent"].toLowerCase()
    return /micromessenger/.test(ua);
}

/**
 * 返回指定数量的随机字符
 * @param {number} num 
 * @returns {string}
 */
function randomChar(num) {
    const min = 65; // 'A' 的 ASCII 码
    const max = 90; // 'Z' 的 ASCII 码

    return Array.from({ length: num }, () =>
        String.fromCharCode(Math.floor(Math.random() * (max - min + 1)) + min)
    ).join('');
}

/**
 * 将指定日期对象转为相应的日期时间字符串
 * @param {Date} date 
 * @returns {string} 表示当前时间的字符串
 */
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds()
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
/**
 * 遍历并输出对象字面值
 * @param {object} body 
 * @param {string|undefined} prefix 
 */
function visitAll(body, prefix = "", visited = new WeakSet()) {
    if (typeof body !== 'object' || body === null) {
        console.log(`Key: ${prefix}, Value: ${body}, Type: ${typeof body}`);
        return;
    }

    if (visited.has(body)) {
        console.log(`Key: ${prefix}, [Circular Reference Detected]`);
        return;
    }

    visited.add(body);

    for (const [key, value] of Object.entries(body)) {
        const currentPrefix = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
            visitAll(value, currentPrefix, visited);
        } else {
            console.log(`Key: ${currentPrefix}, Value: ${value}, Type: ${typeof value}`);
        }
    }
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

/**
 * 读取脚本参数
 * @param {string} key 
 * @returns {string}
 */
function getScriptArgument(key) {
    if (typeof $argument === "undefined") {
        return;
    }

    let body;
    try {
        body = JSON.parse($argument);
    } catch (error) {
        console.log("Invalid JSON:", error);
        return null; // JSON 解析失败返回 null
    }
    return body[key]
}

/**
 * 读取本地持久化参数
 * @param {string} key 
 * @returns {string}
 */
function getPersistentArgument(key) {
    return $persistentStore.read(key);
}

/**
 * 返回当前的脚本类型
 * @returns 
 */
function getScriptType() {
    return typeof $script !== 'undefined' ? $script.type : 'undefined'
}

/**
 * 
 * @param {string} countryCode 
 * @returns 
 */
function countryCodeToEmoji(countryCode) {
    // 将代码转为大写
    countryCode = countryCode.toUpperCase();

    // 如果是三位代码，转换为两位代码
    const threeToTwo = {
        'USA': 'US',
        'CAN': 'CA',
        'GBR': 'GB',
        'FRA': 'FR',
        'DEU': 'DE',
        // 继续添加你需要支持的三位代码
    };

    // 如果代码长度为3，尝试查找转换表
    if (countryCode.length === 3) {
        countryCode = threeToTwo[countryCode] || countryCode.slice(0, 2);
    }

    // 将两位代码转换为相应的Unicode字符
    const codePoints = [...countryCode].map(char => 127397 + char.charCodeAt());

    // 将Unicode字符转换为emoji
    return String.fromCodePoint(...codePoints);
}

function requestLog(uid) {
    if (getScriptType() === 'request') {

    }
}

function responseLog(uid) {
    if (getScriptType() === 'response') {
        let isOutputBody = getScriptArgument("isOutputBody")
        request = $request
        response = $response
        console.log(`${uid} request: ${request.url}, ${request.method} ${response.status}`)
        if (isOutputBody) {
            visitAll(request)
            visitAll(response)
        }
    }
}

/**
 * 
 * @param {Document} document 
 * @returns 
 */
function parseMessages(document) {
    let resp = []
    let headImg = document.querySelector("body > header > div > div.tgme_header_info > a.tgme_header_link > i > img").attributes.src.textContent
    let channelName = document.querySelector("body > header > div > div.tgme_header_info > a.tgme_header_link > div.tgme_header_title_wrap > div.tgme_header_title > span").textContent
    li = document.querySelectorAll("body > main > div > section > div .tgme_widget_message")
    li.forEach(ele => {
        let _arr = ele.attributes["data-post"].value.split('/')
        let username = _arr[0]
        let msgid = _arr[1]
        let title
        let text
        let textTag = ele.querySelector(".js-message_text")
        if (textTag) {
            if (ele.querySelector(".js-message_text>b")) {
                title = ele.querySelector(".js-message_text>b").outerText
            }
            if (ele.querySelector(".js-message_text")) {
                text = ele.querySelector(".js-message_text").outerText
            }
        }
        resp.push({ head: headImg, channelName, username, msgid, title, text })
    })
    return resp
}

/**
 * 请求频道消息网页，解析并返回响应的消息组
 * @param {string} channel 
 * @returns 
 */
async function getChannelMessages(channel) {
    console.log(`正在访问频道: ${channel}`)
    let onceMaxSize = getScriptArgument("onceMaxSize") || 10
    let url = `https://t.me/s/${channel}`
    let lastMessageID = getPersistentArgument(`TelegramLastMessageId-${channel}`)
    if (lastMessageID) {
        lastMessageID = Number(lastMessageID)
        url += `?after=${lastMessageID}`
    }

    try {
        console.log(`channel url: ${url}`)
        let res = await get(url)
        // 如果你要处理 `res`，可以在这里添加逻辑
        if (res.error) {
            console.log(`request ${channel} failed. error: ${error}`)
        } else {
            let document = new DOMParser().parseFromString(res.data, 'text/html');
            let channelMessages = parseMessages(document).filter(element => !lastMessageID || element.msgid > lastMessageID);
            console.log(`get channel ${channel} message count: ${channelMessages.length}`)
            return channelMessages.slice(0, onceMaxSize)
        }
    } catch (error) {
        console.error(`Error fetching data for channel ${channel}:`, error)
    }
}

/**
 * 
 * @param {array} groupMessages 
 * @returns 
 */
function makePushMessages(groupMessages) {
    console.log(`make push messages`)
    let barkToken = getScriptArgument("barkToken")
    let barkGroup = getScriptArgument("barkGroup") || "Telegram"
    let level = getScriptArgument("level") || "passive"

    let messages = []
    // groupMessages 现在是包含所有 channelMessages 的数组
    for (const group of groupMessages) {
        for (const message of group) {
            let url = `tg://resolve?domain=${message.username}&post=${message.msgid}&single`
            let payload = {
                device_key: barkToken,
                title: message.channelName,
                body: `${message.text}\n\n${url}`,
                group: barkGroup,
                level: level,
                icon: message.head,
                url: url
            }
            messages.push({ bark: payload })
        }
    }
    return messages
}

async function main() {
    try {
        let scriptType = getScriptType()
        let uid = randomChar(32)
        console.log(`${uid} script type: ${scriptType}`)
        console.log(``)
        requestLog(uid)
        responseLog(uid)

        // 遍历频道
        let channels = getScriptArgument("channels")
        let groupMessages = []
        // 使用 Promise.all 并行获取所有频道的消息
        try {
            groupMessages = await Promise.all(
                channels.map(async channel => await getChannelMessages(channel))
            );
        } catch (error) {
            console.log(`get channel messages error: ${error}`)
            $done({})
            return
        }


        let messages = makePushMessages(groupMessages)
        if (messages.length === 0) {
            $done({})
            return
        }

        let body = JSON.stringify({ messages: messages }, null, 4)
        // console.log(`body: ${body}`)
        let res
        try {
            res = await post({ url: 'https://p.19940731.xyz/api/notifications/push/v2', headers: { 'Content-Type': "application/json" }, body: body })
            console.log(`push success`)
        } catch (error) {
            console.log(`push messages error: ${error}`)
            $done({})
            return
        }

        if (res.error) {
            console.log(`push messages to bark failed. error: ${res.error}`)
        }

        // 写入本地持久化    
        console.log(`write local persistent`)
        for (const messages of groupMessages) {
            if (messages.length !== 0) {
                let lastMessage = messages.at(-1)
                console.log(`更新 ${lastMessage.username} 缓存成功.`)
                writePersistentArgument(`TelegramLastMessageId-${lastMessage.username}`, lastMessage.msgid)
            }
        }
        $done({})
        return
    } catch (error) {
        console.log(`run main function error ${error}`)
        $done({})
    }
}



try {
    main()
} catch (error) {
    console.log(error)
    $done({})
}
