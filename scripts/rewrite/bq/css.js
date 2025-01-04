


(function () {
    let lastBg = localStorage.getItem('.bq.lastBg')
    if (lastBg) {
        // 创建样式表
        const style = document.createElement('style');
        style.type = 'text/css';
        style.id = "myStyle"
        if (lastBg === "huyan") {
            style.innerHTML = huyan_style
        } else if (lastBg === 'light') {
            style.innerHTML = lighton_style
        } else {
            style.innerHTML = default_style
        }
        // 将样式表添加到文档中
        document.head.appendChild(style);
    }
})();

console.log('deprecated')
