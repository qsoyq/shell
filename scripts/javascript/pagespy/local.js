var script1 = document.createElement('script');
script1.setAttribute('crossorigin', 'anonymous');
// 实际项目中请替换 SDK 的地址连接
script1.src = 'http://pagespy.docker.localhost/page-spy/index.min.js';

var script2 = document.createElement('script');
script2.textContent = 'window.$pageSpy = new PageSpy();';

document.head.prepend(script1);
script1.onload = () => {
    document.head.appendChild(script2);
};
