function removeByClassName(name){
	let items = document.getElementsByClassName(name)
	for(var i=0;i<items.length;i++){
		items[i].remove()
	}
}

function main(){
    
}
console.log(`${$request.url}`)
$done({})