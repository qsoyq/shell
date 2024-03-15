console.log(`loglog`)
let scriptName = $script.name
console.log(`script.name: ${scriptName}`)
console.log(`$environment: ${$environment}`)
console.log(`$argument: ${$argument}`)
for (const key in $environment) {
    console.log(`    ==> Key: ${key}, Value: ${$environment[key]}`);
  }
let lastRunAt = $persistentStore.read("lastRunAt")
if (lastRunAt !== undefined){
    console.log(`lastRunAt: ${lastRunAt}`)
}
const now = new Date().toString()
$persistentStore.write(now, "lastRunAt")
$done({})