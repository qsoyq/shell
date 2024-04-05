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