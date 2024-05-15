function getArgumentObject(){
    if (typeof $argument === "undefined"){
        return undefined
    }
    let body = JSON.parse($argument)
    return body
}

function main(){
    console.log(`enter ${$script.name}`)
    let data = getArgumentObject()
    if(data && data instanceof Object){
        for(const key in data){
            let value = data[key]
            console.log(`key: ${key}, value: ${value}, typeof: ${typeof(value)}`)
        }
    }
    $done({})
}

main()
