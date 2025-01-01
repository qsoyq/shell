// 记忆网页护眼、关灯行为
(function () {
    let lastBg = localStorage.getItem('.bq.lastBg')
    if (lastBg) {
        // @ts-ignore
        nr_setbg(lastBg)
    }
})();


(function () {
    const element = document.getElementById('huyandiv');
    if (element) {
        element.addEventListener('click', function () {
            let lastBg = localStorage.getItem('.bq.lastBg')
            if (lastBg) {
                localStorage.setItem('.bq.lastBg', "")
            } else {
                localStorage.setItem('.bq.lastBg', "huyan")
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
            if (lastBg) {
                localStorage.setItem('.bq.lastBg', "")
            } else {
                localStorage.setItem('.bq.lastBg', "light")
            }
            console.log('lightdiv was clicked!');
        });
    }
})();