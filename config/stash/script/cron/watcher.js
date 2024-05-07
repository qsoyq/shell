// 监控网页状态， 网页不可访问时弹出通知
function printObj(body){
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

function main(){
    let url = getBodyArgument('url')
    if(!url){
        console.log(`url undefined`)
    }
    console.log(`current url: ${url}`)
    $httpClient.get(url, (error, response, data)=>{
        if(response && 200 <= Number(response["status"]) && Number(response["status"]) < 400){

        }else{
            $notification.post(`${$script.name}`, `监控页面响应异常`, `url: ${url}\n\n${error}`)
        }
        $done()
    })
}

main()
