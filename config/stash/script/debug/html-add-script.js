/**
 * 在返回的 html 文本中添加 script 标签执行对应代码
 * 支持传入 url 通过 createElement 生成对象
 * 支持传入代码通过 createElement 生成对象
 * 支持指定在head、body、
 */

// https://github.com/EtherDream/str2gbk
let table

function initGbkTable() {
    // https://en.wikipedia.org/wiki/GBK_(character_encoding)#Encoding
    const ranges = [
        [0xA1, 0xA9, 0xA1, 0xFE],
        [0xB0, 0xF7, 0xA1, 0xFE],
        [0x81, 0xA0, 0x40, 0xFE],
        [0xAA, 0xFE, 0x40, 0xA0],
        [0xA8, 0xA9, 0x40, 0xA0],
        [0xAA, 0xAF, 0xA1, 0xFE],
        [0xF8, 0xFE, 0xA1, 0xFE],
        [0xA1, 0xA7, 0x40, 0xA0],
    ]
    const codes = new Uint16Array(23940)
    let i = 0

    for (const [b1Begin, b1End, b2Begin, b2End] of ranges) {
        for (let b2 = b2Begin; b2 <= b2End; b2++) {
            if (b2 !== 0x7F) {
                for (let b1 = b1Begin; b1 <= b1End; b1++) {
                    codes[i++] = b2 << 8 | b1
                }
            }
        }
    }
    table = new Uint16Array(65536)
    table.fill(0xFFFF)

    const str = new TextDecoder('gbk').decode(codes)
    for (let i = 0; i < str.length; i++) {
        table[str.charCodeAt(i)] = codes[i]
    }
}


// @ts-ignore
const NodeJsBufAlloc = typeof Buffer === 'function' && Buffer.allocUnsafe

const defaultOnAlloc = NodeJsBufAlloc
    ? (/** @type {any} */ len) => NodeJsBufAlloc(len)
    : (/** @type {Iterable<number>} */ len) => new Uint8Array(len)

const defaultOnError = () => 63   // '?'


/**
 * @param {string} str
 */
function str2gbk(str, opt = {}) {
    if (!table) {
        initGbkTable()
    }
    const onAlloc = opt.onAlloc || defaultOnAlloc
    const onError = opt.onError || defaultOnError

    const buf = onAlloc(str.length * 2)
    let n = 0

    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i)
        if (code < 0x80) {
            buf[n++] = code
            continue
        }
        const gbk = table[code]

        if (gbk !== 0xFFFF) {
            buf[n++] = gbk
            buf[n++] = gbk >> 8
        } else if (code === 8364) {
            // 8364 == '€'.charCodeAt(0)
            // Code Page 936 has a single-byte euro sign at 0x80
            buf[n++] = 0x80
        } else {
            const ret = onError(i, str)
            if (ret === -1) {
                break
            }
            if (ret > 0xFF) {
                buf[n++] = ret
                buf[n++] = ret >> 8
            } else {
                buf[n++] = ret
            }
        }
    }
    return buf.subarray(0, n)
}

/** @namespace html.add.script */

/**
 * @typedef {Object} html.add.script.HTTPResponse
 * @property {string|null} error - 错误信息，如果没有错误则为 null
 * @property {object} response - HTTP 响应对象
 * @property {string|null} data - 返回的数据，如果没有数据则为 null
 */

/**
 * @typedef {function(Error|string|null, Object, string|null): void} html.add.script.HTTPCallback
 * 回调函数类型，接受错误、响应和数据作为参数。
 * @param {Error|string|null} error - 错误信息，可以是 Error 对象、字符串或者 null
 * @param {Object} response - HTTP 响应对象
 * @param {string|null} data - 返回的数据，可以是字符串或者 null
 */

/**
 * @typedef {function(Object, html.add.script.HTTPCallback): html.add.script.HTTPResponse} html.add.script.HTTPMethod
 */

/**
 * @typedef {Object} html.add.script.HttpClient
 * @property {html.add.script.HTTPMethod} get - 发送 GET 请求
 * @property {html.add.script.HTTPMethod} post - 发送 POST 请求
 * @property {html.add.script.HTTPMethod} put - 发送 PUT 请求
 * @property {html.add.script.HTTPMethod} delete - 发送 DELETE 请求
 */

/** @type {html.add.script.HttpClient} */
var $httpClient;

var $request, $response, $notification, $argument, $persistentStore, $script

/** @type {function(Object):void} */
var $done

/**
 * 对异步回调的 HTTP 调用包装成 async 函数
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method - HTTP 方法类型，支持 GET、POST、PUT 和 DELETE
 * @param {Object} params - 请求参数对象，包含请求所需的各类信息
 * @returns {Promise<html.add.script.HTTPResponse>} 返回一个 Promise，解析为包含 error、response 和 data 的对象
 * @throws {Error} 如果请求失败，Promise 会被拒绝并返回错误信息
 */
async function request(method, params) {
    return new Promise((resolve, reject) => {
        /** @type {html.add.script.HTTPMethod} */
        const httpMethod = $httpClient[method.toLowerCase()]; // 通过 HTTP 方法选择对应的请求函数
        httpMethod(params, (error, response, data) => {
            if (error) {
                console.log(`Error: ${error}, Response: ${JSON.stringify(response)}, Data: ${data}`);
                reject({ error, response, data }); // 请求失败，拒绝 Promise
            } else {
                resolve({ error, response, data }); // 请求成功，解析 Promise
            }
        });
    });
}

/**
 * 请求封装
 * @param {object} params
 * @returns {Promise<html.add.script.HTTPResponse>}
 */
async function get(params) {
    return request('GET', params);
}

/**
 * 请求封装
 * @param {object} params
 * @returns {Promise<html.add.script.HTTPResponse>}
 */
async function post(params) {
    return request('POST', params);
}

/**
 * 请求封装
 * @param {object} params
 * @returns {Promise<html.add.script.HTTPResponse>}
 */
async function put(params) {
    return request('PUT', params);
}

/**
 * 请求封装
 * @param {object} params
 * @returns {Promise<html.add.script.HTTPResponse>}
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
 * @param {string|undefined} [url] 
 */
function notificationPost(title, subtitle, content, url) {
    const params = url ? { url } : {};
    $notification.post(title, subtitle, content, params)
}

/**
 * 判断当前请求是否来自微信
 * @returns {Boolean} 
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
    if (typeof date === 'undefined') {
        date = new Date()
    }
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
        console.log(`invalid json: ${e}, json: ${string}`)
        return null
    }
}

/**
 * 读取脚本参数
 * @param {string} key 
 * @returns {any|undefined|null}
 */
function getScriptArgument(key) {
    if (typeof $argument === "undefined") {
        return;
    }

    let body;
    try {
        body = JSON.parse($argument);
    } catch (error) {
        console.log(`Invalid Argument JSON: ${error}, argument: ${$argument}`);
        return null; // JSON 解析失败返回 null
    }
    return body[key]
}

/**
 * 从环境中读取参数， 且参数不可为空，否则抛出异常
 * @param {string} key 
 * @returns {any}
 * @throws {Error} 如果找不到对应的参数值，或参数值为 `null` 或 `undefined`，则抛出一个包含错误信息的异常。* 
 */
function mustGetScriptArgument(key) {
    let val = getScriptArgument(key)
    if (val === null || val === undefined) {
        console.log(`can't find value for ${key}`)
        throw `can't find value for ${key}`
    }
    return val
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
* @returns {'request' | 'response' | 'tile' | 'cron'}
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
    const codePoints = [...countryCode].map(char => 127397 + char.charCodeAt(0));

    // 将Unicode字符转换为emoji
    return String.fromCodePoint(...codePoints);
}
/**
 * 返回从 from 到 to 递增或递减的数组，步长为 1
 * @param {number} from 
 * @param {number} to 
 * @returns 
 */
function generateArray(from, to) {
    const start = Math.min(from, to);
    const end = Math.max(from, to);

    // 如果 from 大于 to，生成逆序数组
    if (from > to) {
        return Array.from({ length: end - start + 1 }, (_, i) => end - i);
    } else {
        // 否则生成顺序数组
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
}

/**
 * 解析响应脚本参数
 * @returns {string | undefined}
 */
function getScriptResponseBody(encoding = "utf-8") {
    let body = (typeof $response.body === 'object') ? (new TextDecoder(encoding)).decode(new Uint8Array($response.body)) : $response.body;
    return body
}

/**
 *  处理 telegram.sendMessage MarkdownV2 格式消息体转义
 * @param {string} text 
 * @returns 
 */
function telegramEscapeMarkdownV2(text) {
    const escapeChars = [
        { char: '_', replacement: '\\_' },
        { char: '*', replacement: '\\*' },
        { char: '[', replacement: '\\[' },
        { char: ']', replacement: '\\]' },
        { char: '(', replacement: '\\(' },
        { char: ')', replacement: '\\)' },
        { char: '~', replacement: '\\~' },
        { char: '>', replacement: '\\>' },
        { char: '#', replacement: '\\#' },
        { char: '+', replacement: '\\+' },
        { char: '-', replacement: '\\-' },
        { char: '=', replacement: '\\=' },
        { char: '|', replacement: '\\|' },
        { char: '{', replacement: '\\{' },
        { char: '}', replacement: '\\}' },
        { char: '.', replacement: '\\.' },
        { char: '!', replacement: '\\!' }
    ];

    let escapedText = text;

    escapeChars.forEach(({ char, replacement }) => {
        const regex = new RegExp(`\\${char}`, 'g');
        escapedText = escapedText.replace(regex, replacement);
    });

    return escapedText;
}

async function main() {
    let type = getScriptType()
    let encoding = getScriptArgument('encoding') || 'utf-8'
    switch (type) {
        case "response":
            let contentType = $response.headers["Content-Type"]
            let body = contentType.toLowerCase().includes("gbk") ? getScriptResponseBody('gbk') : getScriptResponseBody()
            if (body && typeof contentType === 'string' && contentType.includes("text/html")) {
                let domParser = new DOMParser();
                let document = domParser.parseFromString(body, 'text/html');
                let scripts = getScriptArgument("scripts") || []
                for (const script of scripts) {
                    let scriptTag = document.createElement('script');
                    let parentTag = script?.parent || "body"
                    if (script.async) {
                        scriptTag.async = script.async
                    }
                    if (script.src) {
                        scriptTag.src = script.src
                    }
                    if (script.textContent) {
                        scriptTag.textContent = script.textContent
                    }
                    scriptTag.type = 'text/javascript'
                    document[parentTag].appendChild(scriptTag);
                }
                let outerHTML = encoding.toLowerCase() == 'gbk' ? str2gbk(document.documentElement.outerHTML) : document.documentElement.outerHTML
                $done({ body: outerHTML })
            } else {
                visitAll($response.headers)
                console.log(`[Warn] invalid response body, content-type: ${$response.headers["Content-Type"]}, body: ${body}`)
                $done({})
            }
            break
        default:
            $done({})
            break;
    }


}

(async () => {
    main().catch(error => {
        console.log(`[Error]: ${error}`)
        // @ts-ignore
        $done()
    })
})();