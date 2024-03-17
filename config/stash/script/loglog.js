const printObj = function(body){
  for (const key in body) {
      console.log(`    ==> Key: ${key}, Value: ${body[key]}`);
  }    
}
console.log(`loglog`)
console.log(`script.name: ${$script.name}`)
console.log(`$argument: ${$argument}`)
printObj($environment)
let lastRunAtKey = "loglogLastRunAt"
let lastRunAt = $persistentStore.read(lastRunAtKey)
if (lastRunAt !== undefined){
    console.log(`lastRunAt: ${lastRunAt}`)
}
$persistentStore.write(new Date().toString(), lastRunAtKey)
$done({})
