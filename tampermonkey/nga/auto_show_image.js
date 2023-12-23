// ==UserScript==
// @name         自动显示Nga图片
// @namespace    http://tampermonkey.net/
// @version      2023-12-23
// @description  通过点击页面上的显示图片按钮, 自动加载图片
// @author       You
// @match        https://bbs.nga.cn/read.php?*
// @icon         https://bbs.nga.cn/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var buttons = document.getElementsByTagName("button")
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        // 在这里执行你想要的操作，例如添加事件监听器或修改按钮的样式等
        if (button.textContent.includes("显示图片")){
            console.log(button)
            button.click()
        }
    }
})();