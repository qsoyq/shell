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
function write(key, val) {
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
    return body?.[key] ?? $persistentStore.read(key);
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

function main() {
    let scriptType = getScriptType()
    let uid = randomChar(32)
    console.log(`${uid} script type: ${scriptType}`)
    requestLog(uid)
    responseLog(uid)


    visitAll($request)
    console.log(`=`.repeat(20))
    console.log(`=`.repeat(20))
    console.log(`typeof response body: ${typeof ($response.body)}`)

    // iOS App 端蜂窝网络下，根据图片的大小决定显示图片或`显示图片`的按钮. 
    // 原判定大小为 100kb.
    if (typeof ($response) !== 'undefined' && typeof ($response.body) !== 'undefined') {
        console.log(`js_bbscode_core.js`)
        let decoder = new TextDecoder('gbk');
        let originBody = decoder.decode($response.body);
        if (originBody.indexOf("a.size>100") !== -1) {

            let size = 1000000000
            let body = originBody.replace("a.size>100", `a.size>${size}`)
            body = new TextEncoder("").encode(body)

            let headers = $response.headers
            headers['content-type'] = 'application/x-javascript; charset=utf-8'

            console.log(`修改显示原图的门槛为 ${size}kb`)
            return $done({ body, headers })
        }
    }
    console.log(30)
    $done({})
    return
}

try {
    main()
} catch (e) {
    console.log(`error: ${e}`)
    $done({})
}
