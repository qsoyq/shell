function getUrlArgument(string, key){
    const url = new URL(string);
    const params = new URLSearchParams(url.searchParams);
    return params.get(key)
}


function rewriteResponse(body){
    const domParser = new DOMParser();
    const document = domParser.parseFromString(body, 'text/html');
    const metaKeywords = document.querySelectorAll('meta[name="keywords"]')

    if(metaKeywords && metaKeywords.length===1){
        let title = metaKeywords[0].content.split(",")[0]
        console.log(`title: ${title}`)

        let element = document.getElementById("chaptercontent");
        element.innerHTML = element.innerHTML.replace(new RegExp(title, 'g'), "");
    }else{
        console.log(`替换失败, metaKeywords: ${metaKeywords}, length: ${metaKeywords.length}`)
        console.log(`body:\n${body}`)
    }
    return document.documentElement.outerHTML
}

function main(){
    if(typeof $response === "undefined"){
        console.log('非响应脚本')
        $done({})
        return
    }
    let body = $response.body
    console.log(`ua: ${$request.headers["User-Agent"]}`)
    body = rewriteResponse(body)
    $done({status: $response.status, headers: $response.headers, body: body})
}
main()
// 