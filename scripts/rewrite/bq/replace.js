// 替换正文污染词汇
let ele = document.getElementById("chaptercontent")
if (ele) {
    let words = [
        ["提yì", "提议"],
        ["尽kuài", "尽快"],
        ["毁miè", "毁灭"],
        ["存zài", "存在"],
        ["表xiàn", "表现"],
        ["程dù", "程度"],
        ["控zhì", "控制"],
        ["狼bèi", "狼狈"],
        ["轻yì", "轻易"],
        ["形shì", "形势"],
        ["表xiàn", "表现"],
        ["导zhì", "导致"],
        ["情yì", "情谊"],
        ["情xù", "情绪"],
        ["严zhòng", "严重"],
        ["医zhì", "医治"],
        ["dù过", "度过"],
        ["过dù", "过度"],
        ["guò", "过"],
        ["恢fù", "恢复"],
        ["一qiē", "一切"],
        ["重dà", "重大"],
        ["告sù", "告诉"],
        ["龗", ""],
        ["请收藏：https://m.bq02.cc", ""],
        ["\\?\\?", ""]
    ]
    let origin = ele.innerHTML
    words.forEach(items => {
        let search = items[0]
        let replace = items[1]
        let modified = origin.replace(new RegExp(search, 'g'), replace);
        if (origin !== modified) {
            console.log(`${search} -> ${replace} ✅`)
        } else {
            console.log(`${search} -> ${replace} ❌ `)
        }
        origin = modified
    })
    ele.innerHTML = origin
}