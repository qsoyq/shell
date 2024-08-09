// 监控网页状态， 网页不可访问时弹出通知
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

async function get(params) {
    return request('GET', params);
}

async function post(params) {
    return request('POST', params);
}

async function put(params) {
    return request('PUT', params);
}

async function delete_(params) {
    return request('DELETE', params);
}

function printObj(body, prefix){
    if(!prefix){
        prefix = "==>"
    }
    for (const key in body) {
        console.log(`${prefix} Key: ${key}, Value: ${body[key]}, Type ${typeof body[key]}`);
        if(typeof body[key]==='object'){
            printObj(body[key], `==${prefix}`)
        }
    }    
}

function getBodyArgument(key){
    if (typeof $argument === "undefined"){
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key]
}

async function main(){
    let urls = getBodyArgument('urls')
    if(!urls){
        console.log(`urls undefined`)
        $done({})
        return 
    }

    printObj(urls)
    for(const url of urls){
        console.log(`current url: ${url}`)
        let resp = await get(url)
        let response = resp.response
        let status = response.status
        let error = resp.error
        if(status <= 0 || (response && 200 <= status && status < 400)){
            // status 为 0 表示客户端连接失败？
        }else{
            $notification.post(`${$script.name}`, `监控页面响应异常: ${status}`, `url: ${url}\n\n${error}`)            
        }        
    }
    $done({})
}

main()
