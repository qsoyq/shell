const printObj = function(body){
    for (const key in body) {
        console.log(`    ==> Key: ${key}, Value: ${body[key]}`);
    }    
}
let url = $request.url
console.log(`url: ${$request.url}`)
printObj($request.headers)
$done({})