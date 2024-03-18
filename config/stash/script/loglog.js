function get(){
  return {code: 0}
}

async function asyncGet(){
  return await new Promise((r=>{r(get())}))
}
async function main(){
    console.log(await asyncGet())
    console.log(await asyncGet())
}

main().then()

// $done({})
