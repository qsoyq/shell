function parseCookie(cookie){
    if (typeof(cookie) !== "string"){
        console.log(`illegally cookie: ${cookie}`)
        return
    }
    let body = {}
    cookie.split(";").forEach(element=>{
        if(element){
            // let arr = element.trim().split("=")
            element = element.trim()
            let index = element.indexOf("=")
            if(index === -1){
                console.log(`illegally cookie field: ${element}`)
                return
            }else{
                let key = element.substring(0, index)
                let value =  element.substring(index+1)
                body[key] = value
            }
        }
    })
    return body
}

function printObj(body){
    for (const key in body) {
        console.log(`    ==> Key: ${key}, Value: ${body[key]}`);
    }    
}

function getCookie(key){
    return $persistentStore.read(`Cookie.${key}`)
}

function setCookie(key, val){
    return $persistentStore.write(val, `Cookie.${key}`)
}

function getBodyArgument(key){
    if (typeof $argument === "undefined"){
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key]
}


function getLocalTodayString(date){
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`
}

function ifRequest(){
    let today = getLocalTodayString(new Date())
    let key = `${$script.name}-cron-${today}`
    console.log(`ifRequest: ${$persistentStore.read(key)}, ${Boolean($persistentStore.read(key))}`)
    return !Boolean($persistentStore.read(key))
}

function main(){
    console.log(`entrypoint main`)
    if (typeof($script) !== 'undefined' && $script.type === 'request'){
        return request()
    }else{
        return cron()
    }
}

function request(){
    console.log(`entrypoint request`)
    console.log(`url: ${$request.url}`)
    let cookie = $request.headers["Cookie"]
    let cookieBody = parseCookie(cookie)
    if(cookieBody){
        let wordpress_logged_in_f7d7e7620d8803515838722d11ca0b60 = cookieBody["wordpress_logged_in_f7d7e7620d8803515838722d11ca0b60"]
        if(!wordpress_logged_in_f7d7e7620d8803515838722d11ca0b60){
            $notification.post($script.name, "解析 cookie 失败", "请先登录后刷新页面")
            printObj($request.headers)
        }else{
            setCookie("wordpress_logged_in_f7d7e7620d8803515838722d11ca0b60", wordpress_logged_in_f7d7e7620d8803515838722d11ca0b60)
            $notification.post($script.name, "获取 cookie 成功", `${wordpress_logged_in_f7d7e7620d8803515838722d11ca0b60}`)
            console.log(`set cookie wordpress_logged_in_f7d7e7620d8803515838722d11ca0b60: ${wordpress_logged_in_f7d7e7620d8803515838722d11ca0b60}`)
        }
    }else{
        $notification.post($script.name, "从 header 获取 cookie 失败", "请先登录后刷新页面")
        printObj($request.headers)
    }

    $done({})
    return
}

function cron(){
    console.log(`entrypoint cron`)
    let wordpress_logged_in_f7d7e7620d8803515838722d11ca0b60 = getCookie("wordpress_logged_in_f7d7e7620d8803515838722d11ca0b60")
    if(!wordpress_logged_in_f7d7e7620d8803515838722d11ca0b60){
        $notification.post(`${$script.name}`, `未获取到 cookie`, `请先登陆网站并确认收到获取 cookie 成功的通知`)
        $done({})
        return
    }
    
    if (ifRequest()){
        url = "https://moeli-desu.com/wp-admin/admin-ajax.php?_nonce=ea114b93e0&action=0e139c4e4747d51618caca099e6c2353&type=goSign"
        $httpClient.get({url: url, headers: {"cookie": wordpress_logged_in_f7d7e7620d8803515838722d11ca0b60}}, (error, _, data)=>{
            if(error){
                console.log(`请求失败 ${error}`)
                $notification.post($script.name, "签到失败", error)
            }else{
                let body = JSON.parse(data)
                console.log(`签到完成, ${body['msg']}`)
                $notification.post($script.name, "签到成功", body["msg"])
                let key = `${$script.name}-cron-${today}`
                let today = getLocalTodayString(new Date())
                $persistentStore.write(today, key)
            }
            $done({})
        })
    }else{
        console.log(`今日已签到, 跳过请求.`)
        $done({})
    }
}
main()
