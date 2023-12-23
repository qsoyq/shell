// ==UserScript==
// @name         leetcode-todo-easy-acceptance_desc
// @namespace    https://github.com/qsoyq/shell/tree/main/tampermonkey/
// @version      0.1
// @description  选择难度为 easy 并且状态为 todo, 按 acceptance 从低到高
// @author       wangqs
// @match        https://leetcode.com/problemset/all/
// @icon         https://assets.leetcode.com/static_assets/public/icons/favicon-192x192.png
// @grant        none
// ==/UserScript==


(function() {
    'use strict';
    var url = new URL(location.href);

    if (!location.href.includes("page")){
        url.searchParams.append('page', 1);
    }
    if (!location.href.includes("difficulty")){
        url.searchParams.append('difficulty', "EASY");
    }
    if (!location.href.includes("status")){
        url.searchParams.append('status', "NOT_STARTED");
    }
    if (!location.href.includes("sorting")){
        url.searchParams.append('sorting', "W3sic29ydE9yZGVyIjoiQVNDRU5ESU5HIiwib3JkZXJCeSI6IkFDX1JBVEUifV0=");
    }

    location.href = url.href
})();












