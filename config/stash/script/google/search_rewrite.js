function removeByClassName(name){
	let items = document.getElementsByClassName(name)
	for(var i=0;i<items.length;i++){
		items[i].remove()
	}
}

function main(){
    let isResponse = Boolean(typeof $response !== "undefined")
    if(!isResponse){
        return
    }
    let body = $response.body
    console.log(`${$request.url}`)
    console.log(`response status: ${$response.status}`)
    $done({status: $response.status, headers: $response.headers, body: body})
}
main()
