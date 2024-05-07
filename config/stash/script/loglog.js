function read(key){
    $persistentStore.read(key)
}

function write(key, val){
    $persistentStore.write(val, key)
}

function isFromWechat(){
    let ua = $request.headers["User-Agent"]
    const _isFromWechat = /MicroMessenger/.test(ua);
    return Boolean(_isFromWechat)
}

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
    return `${year}-${month}-${day} ${hours}:${minutes}`
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



const pushToStash = (title, subtitle, content, url)=>{
    $notification.post(title, subtitle, content,{url: url})
}

const pushToBark = function(title, body, group, copyContent, url, icon, deviceKey){
    let apiUrl = "https://api.day.app/push" 
    let payload = {
        title: title,
        body: body,
        group: group,
        isArchive: "1",
        copy: copyContent,
        url: url,
        icon: icon,
        device_key: deviceKey,
        automaticallyCopy: "1"
    }     
    payload = JSON.stringify(payload)       
    $httpClient.post({
        url: apiUrl,
        headers: {"content-type": "application/json"},
        body: payload
    }, (error, response, data)=>{
        if(error){

        }else{

        }
    })
}  

function gather(params, handler, callback){
    let promiseList = []
    params.forEach(element => {
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
    .catch((error) => {
        callback["catch"](results)
    })
}

// console.log(``)
if(typeof $request !== 'undefined'){
    console.log(`url: ${$request.url}`)
}

if(typeof $response !== 'undefined'){
    console.log(`status: ${$response.status}`)
}
console.log(`${new Date().toString()}`)
$done({})
