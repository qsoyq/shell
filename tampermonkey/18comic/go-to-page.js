// ==UserScript==
// @name         18comicvip
// @namespace    http://tampermonkey.net/
// @version      2024-10-01
// @description  try to take over the world!
// @author       You
// @match        https://18comic.vip/photo/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=18comic.vip
// @grant        none
// ==/UserScript==

function gotoLast() {
    console.log(`goto last page`)
    let lastSelector = "#wrapper > div.menu-bolock.hidden-xs.hidden-sm > ul.menu-bolock-ul > li:nth-child(9) > a"
    let last = document.querySelector(lastSelector)
    if (last) {
        // @ts-ignore
        last.click()
    }
}

function gotoNext() {
    console.log(`goto next page`)
    let nextSelector = "#wrapper > div.menu-bolock.hidden-xs.hidden-sm > ul.menu-bolock-ul > li:nth-child(8) > a"
    let next = document.querySelector(nextSelector)
    if (next) {
        // @ts-ignore
        next.click()
    }
}




(function () {
    'use strict';
    document.addEventListener('keydown', function (event) {
        switch (event.code) {
            case 'ArrowUp':
                console.log('向上箭头被按下');
                break;
            case 'ArrowDown':
                console.log('向下箭头被按下');
                break;
            case 'ArrowLeft':
                gotoLast()
                console.log('向左箭头被按下');
                break;
            case 'ArrowRight':
                console.log('向右箭头被按下');
                gotoNext()
                break;
            default:
                console.log('其他按键被按下:', event.key);
        }
    });
    // Your code here...
})();