console.log("bilbee-startup-free")
let url = $request.url;
let method = $request.method;
let body = $response.body
let status = $response.status
console.log(`url is: ${url}`)
console.log(`method is: ${method}`)
console.log(`status is: ${status}`)

if (body.length === 0){
    $done({})
}else{
    let obj = JSON.parse(body)
    // if ("data" in obj && "HomeLoadNew" in obj.data && "HomeLoadNew" in obj.data.HomeLoadNew){
    if (obj?.data?.HomeLoadNew){
        for (var i = 0; i < obj.data.HomeLoadNew.adItems.length; i++) {
            console.log(`去除广告 ${obj.data.HomeLoadNew.adItems[i].imgUrl} 成功`)
            obj.data.HomeLoadNew.adItems[i].imgUrl = '';
        }
        let resp = JSON.stringify(obj)
        $done({body: resp})
    }else{
        $done({})
    }
}
