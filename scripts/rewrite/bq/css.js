(function () {
    let lastBg = localStorage.getItem('.bq.lastBg')
    if (lastBg) {
        // 创建样式表
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            #read {
                background-color: rgb(17, 17, 17);
            }
        `;

        // 将样式表添加到文档中
        document.head.appendChild(style);
    }
})();
