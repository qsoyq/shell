// 替换正文污染词汇
let ele = document.getElementById("chaptercontent")
if (ele) {
    let words = [
        ["导zhì", "导致"],
        ["情yì", "情谊"],
        ["严zhòng", "严重"],
        ["医zhì", "医治"],
        ["dù", "度"],
        ["guò", "过"],
        ["恢fù", "恢复"],
        ["一qiē", "一切"],
        ["dà", "大"],
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