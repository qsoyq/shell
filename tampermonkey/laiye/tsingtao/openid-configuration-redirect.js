// ==UserScript==
// @name         tsigntao-openid-redirect
// @namespace    https://github.com/qsoyq/shell/tree/main/tampermonkey/
// @version      v0.0.1
// @description  将/.well-known/openid-configuration 重定向到 /well-known/openid-configuration
// @author       wangqs
// @match        https://chatai.tsingtao.com.cn/chatbot/*
// @icon         https://chatai.tsingtao.com.cn/favicon.ico
// @grant        none
// ==/UserScript==


(function() {
    'use strict';
    // 保存原始的 fetch 函数引用
    const originalFetch = window.fetch;

    // 创建一个新的 fetch 函数，用于拦截和修改请求
    window.fetch = function(url, options) {
    // 这里可以对请求进行修改
    // 比如修改 URL、请求头部、请求参数等
    const modifiedOptions = {
        ...options, // 复制原始请求的参数
        headers: {
        ...options.headers // 复制原始请求的头部信息
        }
        // 可以根据需求修改其他请求参数，比如 method、body 等
    };

    // 输出拦截到的请求信息，方便调试
    console.log('Intercepted Request:', url, modifiedOptions);
    if (url=="https://chatai.tsingtao.com.cn/.well-known/openid-configuration"){

        url = url.replace(".well", "well")
    }
    console.log('After modified Request:', url, modifiedOptions);
    // 返回被修改后的请求
    return originalFetch(url, modifiedOptions);
    };

    // 现在任何使用 fetch 的请求都会被上面的函数拦截和修改

})();

