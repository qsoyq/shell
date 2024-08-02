// ==UserScript==
// @name         笔趣阁小说内容清理
// @namespace    https://github.com/qsoyq/shell/tree/main/tampermonkey/
// @version      v0.0.1
// @description  移除小说文本中的章节标题
// @author       wangqs
// @match        https://www.bq16.cc/book/*
// @icon         https://www.bq16.cc/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function replaceTextInElements(id, find, replace) {
        let element = document.getElementById(id);
        element.innerHTML = element.innerHTML.replace(new RegExp(find, 'g'), replace);
    }

    const metaKeywords = document.querySelectorAll('meta[name="keywords"]')
    if(metaKeywords && metaKeywords.length===1){
        let title = metaKeywords[0].content.split(",")[0]
        console.log(`title: ${title}`)
        replaceTextInElements('chaptercontent', title, '');
    }

})();