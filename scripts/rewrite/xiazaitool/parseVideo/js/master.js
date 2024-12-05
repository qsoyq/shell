// 2024-12-06 04:29:44
$(document).ready(function () {
    //复选框操作
    var allChecked = true; // 初始状态为不权限状态

    //选择框改变事件
    //jQuery的append方法添加的元素添加点击事件，需要使用事件委托（event delegation）的方式。事件委托是一种将事件处理程序附加到祖先元素上，以便在事件冒泡阶段处理事件的方法。
    $('#set-list-preview').on('change', '.checkbox', function (event) {
        // 检查是否所有复选框都被选中
        var checkFileBox = $(".checkbox:checked").length;
        allChecked = $(".checkbox").length === checkFileBox;

        // 防止复选框的点击事件冒泡到图片上
        event.stopPropagation();
        var checkbox = $(this);
        var image = checkbox.closest('.p-3').find('.preview-image');
        image.toggleClass('selected', checkbox.prop("checked"));
        var video = checkbox.closest('.p-3').find('.preview-video');
        video.toggleClass('selected', checkbox.prop("checked"));

        switchStatus(checkFileBox);

        // 更新按钮文本
        $("#toggleButton").text(allChecked ? "取消全选" : "全选");
    });


    $("#toggleButton").click(function () {
        // 切换全选/全不选状态
        allChecked = !allChecked;
        // 更新所有复选框的状态
        $(".checkbox").prop("checked", allChecked);
        $("#results-display  img").toggleClass("selected", allChecked);
        if (allChecked) {
            switchStatus(2);
        } else {
            switchStatus(0);
        }
        // 更新按钮文本
        $("#toggleButton").text(allChecked ? "取消全选" : "全选");
    });


    // 点击图片时切换复选框状态
    //jQuery的append方法添加的元素添加点击事件，需要使用事件委托（event delegation）的方式。事件委托是一种将事件处理程序附加到祖先元素上，以便在事件冒泡阶段处理事件的方法。
    $('#set-list-preview').on('click', '.preview-image', function () {
        console.log("图片被点击了！");
        var checkbox = $(this).closest('.p-3').find('.checkbox');
        checkbox.prop("checked", !checkbox.prop("checked"));
        $(this).toggleClass('selected', checkbox.prop("checked"));
        // 在这里执行你的方法或代码
        // 检查是否所有复选框都被选中
        var checkFileBox = $(".checkbox:checked").length;
        allChecked = $(".checkbox").length === checkFileBox;
        switchStatus(checkFileBox);
        // 更新按钮文本
        $("#toggleButton").text(allChecked ? "取消全选" : "全选");
    });

    // 点击视频时切换复选框状态
    //jQuery的append方法添加的元素添加点击事件，需要使用事件委托（event delegation）的方式。事件委托是一种将事件处理程序附加到祖先元素上，以便在事件冒泡阶段处理事件的方法。
    $('#set-list-preview').on('click', '.preview-video', function () {
        console.log("视频被点击了！");
        var checkbox = $(this).closest('.p-3').find('.checkbox');
        checkbox.prop("checked", !checkbox.prop("checked"));
        $(this).toggleClass('selected', checkbox.prop("checked"));
        // 在这里执行你的方法或代码
        // 检查是否所有复选框都被选中
        var checkFileBox = $(".checkbox:checked").length;
        allChecked = $(".checkbox").length === checkFileBox;

        switchStatus(checkFileBox);

        // 更新按钮文本
        $("#toggleButton").text(allChecked ? "取消全选" : "全选");
    });


    //判断用户有没有登录，选择展示的内容
    var userId = $.trim(localStorage.getItem("xzg-userId"));
    if (userId && userId.length !== 0) {

        $.ajax({
            url: window.serverUrl + 'user/userInfo/' + userId,
            // url: 'http://42.193.105.12:9605/' + 'user/userInfo/' + userId,
            method: 'GET',
            success: function (response) {
                // 检查返回的状态和成功标志
                var event = new Event('getUserInfoDone'); // 创建一个事件
                window.dispatchEvent(event)
                if (response.status === 200 && response.success) {
                    var userInfo = response.data;
                    console.log(userInfo);
                    if (userInfo) {
                        //展示用户名称
                        $(".login-register").addClass("d-none");
                        $("#user-main").removeClass("d-none");

                        $(".user-name").html(userInfo.account);
                        $("#user-name").html(userInfo.account);
                        $("#is-vip").html(userInfo.isMember ? "是" : "否");
                        $("#vip-time").html(userInfo.validityPeriod);
                        var parseNumber = 0;
                        if (userInfo.isMember) {
                            if (userInfo.vipType == 3) {
                                parseNumber = userInfo.parseNumber;
                            } else {
                                parseNumber = "无限制";
                            }
                        }

                        $("#parse-number").html(parseNumber);
                        $("#create-time").html(userInfo.createTime);

                        window.userInfo = userInfo;

                    } else {
                        //展示登录注册
                        $(".login-register").removeClass("d-none");
                        $("#user-main").addClass("d-none");
                        localStorage.removeItem("xzg-userId")
                    }
                    console.log(response);
                } else {
                    console.error('操作失败:', response.message);
                }
            },
            error: function (xhr, status, error) {
                var event = new Event('getUserInfoDone'); // 创建一个事件
                window.dispatchEvent(event)
                console.error('Error:', error);
            }
        });

    } else {
        var event = new Event('getUserInfoDone'); // 创建一个事件
        window.dispatchEvent(event)
        //展示登录注册
        $(".login-register").removeClass("d-none");
        $("#user-main").addClass("d-none");
    }


    //退出登录
    // 为具有 "dropdown-item" 类的 <a> 元素添加点击事件
    $("#sign-out").click(function () {
        if ($.trim(userId).length !== 0 && userId !== "undefined") {
            $.ajax({
                url: window.serverUrl + "user/logout/" + localStorage.getItem("xzg-userId"), // Assuming action attribute is set for the form
                type: "DELETE", // Assuming method attribute is set for the form
                success: function (response) {
                    // Handle success response
                    console.log(response);
                    if (response.status === 200) {
                        localStorage.removeItem("xzg-userId");
                        window.location.replace("https://www.xiazaitool.com");
                    }
                },
                error: function (xhr, status, error) {
                    // Handle error response
                    console.error(xhr.responseText);
                }
            });
        } else {
            location.reload();
        }

    });


    window.onload = function () {
        var userAgent = navigator.userAgent.toLowerCase();
        console.log(userAgent);
        //判断是否是微信浏览器
        if (userAgent.indexOf("weixin") !== -1) {
            setTimeout(function () {
                alert("由于微信浏览器限制下载，推荐使用其他浏览器打开网站");
            }, 2000);
        }

        //判断是否是苹果手机浏览器浏览器
        if (userAgent.indexOf("iphone") !== -1 && userAgent.indexOf("safari") !== -1 && userAgent.indexOf("version") !== -1) {
            setTimeout(function () {
                alert("由于苹果浏览器限制下载，推荐使用其他浏览器打开网站");
            }, 2000);
        }
    };


    //禁用右键菜单
    // document.addEventListener('contextmenu', function (e) {
    //     e.preventDefault();
    // });

    // 拦截 F12 和开发者工具快捷键
    // document.addEventListener('keydown', function (e) {
    //     // F12 或 Ctrl+Shift+I
    //     if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
    //         e.preventDefault();
    //     }
    //     // Ctrl+Shift+J 或 Ctrl+U
    //     if ((e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'U')) {
    //         e.preventDefault();
    //     }
    //
    //     // 禁用 Ctrl+U (查看源代码)
    //     if (e.ctrlKey && e.key === 'u') {
    //         e.preventDefault();
    //     }
    // });
    //
    // var firstTime
    // var lastTime
    // let intervalId = setInterval(() => {
    //     firstTime = Date.now()
    //     debugger
    //     lastTime = Date.now()
    //     if (lastTime - firstTime > 100) {
    //         console.log('这里可以屏蔽当前dom或者启动无限数据循环')
    //         clearInterval(intervalId);
    //         // 清空页面内容并刷新
    //         document.body.innerHTML = ""; // 清空页面
    //         document.body.style.backgroundColor = "#ffffff"; // 设置背景为白色
    //         // location.reload(); // 刷新页面
    //     }
    // }, 300);


});

// 手机端和PC端区分显示按钮
function switchStatus(number) {
    var userAgent = navigator.userAgent.toLowerCase();
    console.log(userAgent);

    //用户是移动设备，并且选择多个文件时，隐藏下载按钮，否则隐藏压缩下载按钮
    if (userAgent.indexOf("android") !== -1 || userAgent.indexOf("iphone") !== -1 || userAgent.indexOf("ipad") !== -1
        || userAgent.indexOf("ipod") !== -1 || userAgent.indexOf("mac os") !== -1 || userAgent.indexOf("Android") !== -1) {

        if (number > 1) {
            $("#downloadLink").hide();
            $("#compressedDownload").show();
        } else {
            $("#downloadLink").show();
            $("#compressedDownload").hide();
        }
    } else {
        $("#downloadLink").show();
        $("#compressedDownload").show();
    }
}

// 处理解析后的页面展示
function resultHandle(response) {
    var imageList = response.voideDeatilVoList;

    // 显示下载按钮，并设置下载链接
    $("#waitAnimation").hide();
    $('#downloadArea').show();

    //当返回的list中只有一个结果时，隐藏全选
    if (imageList.length === 1) {
        $("#toggleButton").hide();
    }
    switchStatus(imageList.length);

    //微博特殊处理
    if (response.platform === "weibo") {
        $("#compressedDownload").hide();
    } else {
        $("#compressedDownload").show();
    }

    // if (response.platform === 'bilibili' && urlInput.indexOf("p=") !== -1) {
    //     // 解析 URL，提取参数部分
    //     var params = new URLSearchParams(new URL(urlInput).search);
    //
    //     // 获取特定参数的值
    //     var parameterValue = params.get('p');
    //
    //     if (parameterValue) {
    //         if (imageList.length >= parameterValue) {
    //             $("#downloadLink").attr("href", imageList[parameterValue - 1].url);
    //         }
    //         console.log(parameterValue);
    //     } else {
    //         console.log("未找到参数值");
    //     }
    // } else if (response.platform === 'xhs') {
    //     //小红书特殊处理,小红书的下载是打包所有文件下载
    //
    //
    // } else {
    // }
    $("#downloadLink").attr("href", imageList[0].url);


    var imageContainer = $("#set-list-preview");

    $.each(imageList, function (index, imageUrl) {
        var imageHTML = '';
        if (imageUrl.type === 'image') {
            imageHTML = '<div class="col">' +
                '              <div class="p-3 preview-unit">' +
                '                    <div class="grid-top-margin row text-center">' +
                '                        <div class="mt-1">' +
                '                            <input type="checkbox"  class="checkbox" checked />' +
                '                        </div>' +
                '                        <div class="mt-1">' +
                '                           <img src="' + imageUrl.url + '" class="preview-image" />' +
                '                        </div>' +
                '                    </div>' +
                '                </div>' +
                '            </div>';
            $('#set-list-preview').removeClass("row-cols-1").addClass("row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5")
        } else {
            imageHTML = '<div class="col w-100">' +
                '    <div class="p-3 preview-unit">' +
                '        <div class="grid-top-margin row text-center">' +
                '            <div class="mt-1 col-12">' +
                '                <input type="checkbox"  class="checkbox" checked />' +
                '            </div>' +
                '            <div class="col-12 mt-1">' +
                '                <video controls="controls" style="max-height: 380px;" class="preview-video w-75">' +
                '                    <source src="' + imageUrl.url + '"' +
                '                            type="video/mp4">' +
                '                </video>' +
                '            </div>' +
                '        </div>' +
                '    </div>' +
                '</div>';

            $('#set-list-preview').removeClass("row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5").addClass("row-cols-1")
        }

        imageContainer.append(imageHTML);
    });
    //解析完成，允许点击重新解析按钮
    $("#downloadButton").prop('disabled', false);
}

// 点击复制内容
// 给按钮添加点击事件
// $('#shareLink').click(function () {
//     var urlToCopy = "https://www.xiazaitool.com/  抖音、快手、皮皮虾、小红书去水印，推荐使用浏览器打开";
//
//     navigator.clipboard.writeText(urlToCopy).then(function () {
//         $("#inputPrompt").text("复制成功").show();
//     }).catch(function (err) {
//         console.error('复制失败:', err);
//     });
// });
function copyToClipboard(text) {
    var input = document.createElement('input');
    input.setAttribute('value', text);
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
}

async function confidential(params) {
    const salt = "1b23a4426e30435fa6b132dd0c56c835";

    console.log(salt + params.url + params.platform);
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + params.url + params.platform);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

$('#shareLink').click(function () {
    let urlToCopy = "https://www.xiazaitool.com/ 抖音、快手、皮皮虾、小红书去水印，推荐使用浏览器打开";

    try {
        copyToClipboard(urlToCopy);
        $("#inputPrompt").text("复制成功").show();
    } catch (err) {
        console.error('复制失败:', err);
    }
});

//判断设备类型
function deviceModel() {
    var userAgent = navigator.userAgent.toLowerCase();
    console.log(userAgent);

    if (userAgent.indexOf("android") !== -1 || userAgent.indexOf("iphone") !== -1 || userAgent.indexOf("ipad") !== -1
        || userAgent.indexOf("ipod") !== -1 || userAgent.indexOf("mac os") !== -1 || userAgent.indexOf("Android") !== -1) {

        if (userAgent.indexOf("mac os") !== -1) {
            if (userAgent.indexOf("iphone") !== -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }

    } else {
        return false;
    }
}