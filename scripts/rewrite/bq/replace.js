// 替换正文污染词汇
let ele = document.getElementById("chaptercontent")
if (ele) {
    let words = [["情yì", "情谊"], ["严zhòng", "严重"], ["dù", "度"], ["guò", "过"], ["zhì", "治"], ["fù", "复"], ["qiē", "切"], ["dà", "大"], ["sù", "诉"], ["龗", ""], ["请收藏：https://m.bq02.cc", ""], ["\\?\\?", ""]]
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