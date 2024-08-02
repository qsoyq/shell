function main(){
    let url = "https://www.w3schools.com/xml/note.xml"
    $httpClient.get(url, (err, _, xmlBody) => {
        if(err){
            console.log(`${err}`)
            $done({})
            return
        }
        url = "https://p.19940731.xyz/api/convert/xml/json"
        let payload = JSON.stringify({content: xmlBody})
        $httpClient.post({url: url, headers: {"content-type": "application/json"}, body: payload}, (error, response, data)=>{
            if(error){
                console.log(`xml 转 json 请求失败: ${error}, status: ${response.status}`)
            }
            $done({})
            let body = JSON.parse(JSON.parse(data)['content'])
            console.log(`${body[['note']['to']]}`)
            body['a']['b'] // error
            console.log(`done`)
        })
    })
}
main()