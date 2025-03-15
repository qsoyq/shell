function gotoLast() {
    let video = document.getElementById("player_one_html5_api")
    if (video) {
        // @ts-ignore
        video.currentTime = Math.max(0, video.currentTime - 10)
    }
}

function gotoNext() {
    let video = document.getElementById("player_one_html5_api")
    if (video) {
        // @ts-ignore
        video.currentTime = Math.min(video.duration, video.currentTime + 10)
    }
}

function playOrPause() {
    let video = document.getElementById("player_one_html5_api")
    if (video) {
        // @ts-ignore
        if (video.paused) {
            // @ts-ignore
            video.play(); // 播放视频
        } else {
            // @ts-ignore
            video.pause(); // 暂停视频
        }
    }
}

/**
 * @param {{ code: any; preventDefault: () => void; key: any; }} event
 */
function keydown(event) {
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
        case "Space":
            console.log(`空格键被按下`);
            event.preventDefault(); // 防止默认行为（如滚动页面）
            playOrPause()
            break
        default:
            console.log(`其他按键被按下:${event.key}`);
    }
}


(function () {
    'use strict';
    document.addEventListener('keydown', keydown);
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            // 进入全屏
            console.log('进入全屏');
            // 添加键盘监听
            document.addEventListener('keydown', keydown);
        } else {
            // 退出全屏
            console.log('退出全屏');
            // 移除键盘监听
            // document.removeEventListener('keydown', keydown);
        }
    })
})();