function getBodyArgument(key){
    if (typeof $argument === "undefined"){
        return undefined
    }
    let body = JSON.parse($argument)
    return body[key]
}

function main(){
    let keys = getBodyArgument("keys")
    if(keys && keys instanceof Array){
        let count = 0
        keys.forEach(key=>{
            let value = $persistentStore.read(key)
            console.log(`key: ${key}, value: ${value}, typeof: ${typeof(value)}`)
            if(value){
                count += 1
            }
            
        })
        console.log(`找到${count}条预定义的持久化存储数据`)
    }else{
        console.log('未找到预定义的持久化存储数据')
    }
    $done({})
}

main()
