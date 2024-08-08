// 基于 https://raw.githubusercontent.com/xykt/RegionRestrictionCheck/main/check.sh
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

async function parseBilibiliChinaMainland(){
    let res = await get("https://api.bilibili.com/pgc/player/web/playurl?avid=82846771&qn=0&type=&otype=json&ep_id=307247&fourk=1&fnver=0&fnval=16&module=bangumi")
    if(res.error){
        console.log(res.error)
        printObj(res)
        return '哔哩哔哩大陆: Failed'
    }else{
        let body = JSON.parse(res.data)
        if(body.code === 0){
            return '哔哩哔哩大陆: Yes'
        }else if (body.code === -10403){
            return '哔哩哔哩大陆: No'
        }else{
            return '哔哩哔哩大陆: Failed'
        }
    }
}

async function parseBilibiliHKMCTW(){
    let res = await get("https://api.bilibili.com/pgc/player/web/playurl?avid=18281381&cid=29892777&qn=0&type=&otype=json&ep_id=183799&fourk=1&fnver=0&fnval=16&module=bangumi")
    if(res.error){
        console.log(res.error)
        printObj(res)
        return '哔哩哔哩港澳台: Failed'
    }else{
        let body = JSON.parse(res.data)
        
        if(body.code === 0){
            return '哔哩哔哩港澳台: Yes'
        }else if (body.code === -10403){
            return '哔哩哔哩港澳台: No'
        }else{
            return '哔哩哔哩港澳台: Failed'
        }
    }
}

async function parseTiktok() {
    // let res = await get("https://www.tiktok.com/")
    return `Tiktok: Failed`
}

async function main(){

    console.log()
    let content = ''
    content = `${await parseBilibiliChinaMainland()}`
    content = `${content}\n${await parseBilibiliHKMCTW()}`
    content = `${content}\n${await parseTiktok()}`
    console.log(content)
    const panel = {
        title: `流媒体解锁检测`,
        content: content
        // icon: params.icon,
        // "icon-color": params.color
    };
    $done(panel);    
    $done()
}
main()
