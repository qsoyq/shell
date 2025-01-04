const default_style = `
`;

const huyan_style = `
    body {
        background-color: rgb(204, 232, 207) !important;
    }
    #chaptercontent {
        color: #000000 !important;
    }        
`;

const lighton_style = `
    body {
        background: rgb(3, 3, 3) !important;
    }

    .Readpage {
        background: rgb(3, 3, 3) !important;
        color: rgb(3, 3, 3) !important;
    }

    .header {
        background: rgb(3, 3, 3) !important;
    }                            

    #chaptercontent {
        color: rgb(153, 153, 153) !important;
    }
`;

// 记忆网页护眼、关灯行为
(function () {
    let lastBg = localStorage.getItem('.bq.lastBg')
    if (lastBg) {
        // @ts-ignore
        // nr_setbg(lastBg)
        // 创建样式表
        const style = document.createElement('style');
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


(function () {
    const element = document.getElementById('huyandiv');
    if (element) {
        element.addEventListener('click', function () {
            let lastBg = localStorage.getItem('.bq.lastBg')
            let style = document.getElementById("myStyle")
            if (lastBg !== 'huyan') {
                localStorage.setItem('.bq.lastBg', "huyan")
                if (style) {
                    style.innerHTML = huyan_style
                    console.log(`change sytle to huyan_style`)
                }
            } else {
                localStorage.setItem('.bq.lastBg', "")
                if (style) {
                    style.innerHTML = default_style
                    console.log(`change sytle to default_style`)
                }
            }
            console.log('huyandiv was clicked!');
        });
    }
})();

(function () {
    const element = document.getElementById('lightdiv');
    if (element) {
        element.addEventListener('click', function () {
            let lastBg = localStorage.getItem('.bq.lastBg')
            let style = document.getElementById("myStyle")
            if (lastBg !== 'light') {
                localStorage.setItem('.bq.lastBg', "light")
                if (style) {
                    style.innerHTML = lighton_style
                    console.log(`change sytle to lighton_style`)
                }
            } else {
                localStorage.setItem('.bq.lastBg', "")
                if (style) {
                    style.innerHTML = default_style
                    console.log(`change sytle to default_style`)
                }
            }
            console.log('lightdiv was clicked!');
        });
    }
})();
