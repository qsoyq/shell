
(function () {
    console.log('swipe')
    let chaptercontent = document.getElementById('chaptercontent')
    if (!chaptercontent) {
        return
    }
    let startX
    chaptercontent.addEventListener('touchstart', (event) => {
        startX = event.touches[0].clientX; // 记录起始触摸点的 X 坐标
    });

    chaptercontent.addEventListener('touchmove', (event) => {
        // 这里可以处理滑动过程中的逻辑
    });

    chaptercontent.addEventListener('touchend', (event) => {
        const endX = event.changedTouches[0].clientX; // 记录结束触摸点的 X 坐标
        const distance = endX - startX; // 计算滑动距离

        if (distance > 50) {
            // 向右滑动
            alert('Swiped Right!');
        } else if (distance < -50) {
            // 向左滑动
            alert('Swiped Left!');
        }
    });
})();