// ==UserScript==
// @name         nga-auto-scroll
// @namespace    http://tampermonkey.net/
// @version      2024-11-21
// @description  try to take over the world!
// @author       You
// @match        https://bbs.nga.cn/read.php?tid=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nga.cn
// @grant        none
// ==/UserScript==

/** 获取当前 URL 中的参数
 * @param {any} key
 */
function getUrlArgument(key) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    return params.get(key) || null
}



/**
 * @param {string} id
 */
function scrollIntoView(id) {
    let element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth', // 平滑滚动
            // block: 'start',     // 元素在视口中的垂直对齐方式
            // inline: 'nearest'   // 元素在视口中的水平对齐方式
        });
    }
}

/**
 * @param {number} number
 */
function getPageFromNumber(number) {
    const pageSize = 20; // 每页大小
    return Math.floor(number / pageSize) + 1 // 计算页数
}


function main() {
    let currentPostId = 0
    let tid = getUrlArgument("tid")
    let page = getUrlArgument("page")
    let scroll = getUrlArgument("_scroll")
    let keyname = `nga-last-post-${tid}`
    let cache = localStorage.getItem(keyname)
    if (!tid) {
        return
    }

    if (cache) {
        currentPostId = Number(cache)
        let targetPage = getPageFromNumber(currentPostId)
        if (!page) {
            // 仅当首次打开页面的时候才进行自动跳转
            console.log(`page: ${page}, target page: ${targetPage}`)
            window.location.href = `https://bbs.nga.cn/read.php?tid=${tid}&page=${targetPage}&_scroll=posterinfo${currentPostId}`
        }
    }

    if (scroll) {
        scrollIntoView(scroll)
    }
    // 根据缓存，跳转到 post 对应页面
    // 创建一个 Intersection Observer 实例
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // console.log(`${entry.target.id} is in view!`);
                currentPostId = Math.max(Number(entry.target.id.split("posterinfo").at(1)), currentPostId)
                console.log(`current post id: ${currentPostId}`)
                localStorage.setItem(keyname, `${currentPostId}`)
            } else {
                // console.log(`${entry.target.id} is out of view!`);
            }
        });
    });


    // 选择要观察的元素
    let targets = document.getElementsByClassName("posterinfo")
    for (const target of targets) {
        observer.observe(target);
    }


    window.addEventListener('scroll', () => {
        let targets = document.getElementsByClassName("posterinfo")
        for (const target of targets) {
            observer.observe(target);
        }
    });
}

(function () {
    'use strict';
    window.addEventListener("load", () => {
        main()
        // 恢复翻页按钮的默认行为
        setTimeout(() => {
            // @ts-ignore
            window._LOADERREAD.htmlProc = (all, go) => {
                location.href = go.url
            }
            console.log('replace window._LOADERREAD.htmlProc')
        },)

    })

})();


