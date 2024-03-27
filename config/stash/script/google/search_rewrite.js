function getUrlArgument(string, key){
    const url = new URL(string);
    const params = new URLSearchParams(url.searchParams);
    return params.get(key)
}

function removeByClassName(document, name){
	let items = document.getElementsByClassName(name)
	for(var i=0;i<items.length;i++){
        console.log(`remove itme: ${items[i]}`)
		items[i].remove()
	}
}

function rewriteResponse(content){
    const domParser = new DOMParser();
    const document = domParser.parseFromString(content, 'text/html');
    removeByClassName(document, "ULSxyf") // 图片
    removeByClassName(document, "Lv2Cle Ww4FFb vt6azd") // 图片
    removeByClassName(document, "f7Znc ywd3Gc aGWfTc") // 图片    

    removeByClassName(document, "RzdJxc") // 视频
    removeByClassName(document, "ClpmGe adDDi") // 视频
    removeByClassName(document, "MmMIvd jRKCUd") // 视频

    // removeByClassName(document, "YSlUOe") // 用户还搜索了
    removeByClassName(document, "qrtwm") // 用户还搜索了
    removeByClassName(document, "ouy7Mc adDDi") // 用户还搜索了

    removeByClassName(document, "oIk2Cb") // 相关搜索
    return document.documentElement.outerHTML
}

function main(){
    if(typeof $response === "undefined"){
        $done({})
        return
    }
    let body = $response.body
    console.log(`q: ${getUrlArgument($request.url, 'q')}`)
    console.log(`ua: ${$request.headers["User-Agent"]}`)
    body = rewriteResponse(body)
    $done({status: $response.status, headers: $response.headers, body: body})
}
main()
