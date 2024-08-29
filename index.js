document.getElementById('messageInput').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault(); // 阻止默认的回车行为（如换行）
        sendMessage();
    }
});

// 点击发送按钮
document.getElementById('sendButton').addEventListener('click', function() {
    sendMessage();
    convertLinksToHyperlinks();
});

function convertLinksToHyperlinks() {
    // 获取所有带有 chat-message__text 类的 div 元素
    const divs = document.querySelectorAll('div.chat-message__text');

    // 遍历每个 div 元素
    divs.forEach(div => {
        // 获取 div 的内容
        const content = div.textContent.trim();

        // 检查内容是否是一个链接（简单的正则表达式检查）
        const linkPattern = /^(https?:\/\/|www\.)[\w\d./?=#+-]+$/;
        if (linkPattern.test(content)) {
            // 创建一个新的 <a> 元素
            const a = document.createElement('a');
            a.href = content.startsWith('www.') ? 'http://' + content : content;
            a.textContent = content;
            a.target = '_blank'; // 在新标签页中打开链接

            // 清空 div 的内容并添加新的 <a> 元素
            div.innerHTML = '';
            div.appendChild(a);
        }
    });
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const messageText = messageInput.value.trim();

    if (messageText) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.dataset.timestamp = new Date().getTime(); // 添加时间戳
        messageElement.dataset.type = 'text'; // 添加消息类型
        messageElement.dataset.text = messageText; // 添加消息内容

        const avatarElement = document.createElement('img');
        avatarElement.className = 'chat-message__avatar';
        avatarElement.src = '../assets/WebChat.png'; // 头像图片地址

        const textElement = document.createElement('div');
        textElement.className = 'chat-message__text';
        textElement.textContent = messageText;

        messageElement.appendChild(avatarElement);
        messageElement.appendChild(textElement);
        chatMessages.appendChild(messageElement);

        // 发送文本到后端
        sendTextToServer(messageText);

        // 清空输入框
        messageInput.value = '';

        // 滚动到最新消息
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 重新绑定双击事件
        enableDoubleClickCopy();
    }
}

function sendTextToServer(text) {
    fetch('save_text.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function loadChatHistory() {
    return fetch('load_texts.php')
        .then(response => response.json())
        .catch((error) => {
            console.error('Error:', error);
            return [];
        });
}

function loadFileHistory() {
    return fetch('load_files.php')
        .then(response => response.json())
        .catch((error) => {
            console.error('Error:', error);
            return [];
        });
}

// 加载所有消息刷新（移除懒加载）
function loadAllHistory() {
    Promise.all([loadChatHistory(), loadFileHistory()])
        .then(([textData, fileData]) => {
            const chatMessages = document.getElementById('chatMessages');
            const combinedData = [
                ...textData.map(item => ({ ...item, type: 'text' })),
                ...fileData.map(item => ({ ...item, type: 'file' }))
            ];

            // 按时间戳排序
            combinedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            combinedData.forEach(item => {
                const messageElement = document.createElement('div');
                messageElement.className = 'chat-message';
                messageElement.dataset.timestamp = item.timestamp;
                messageElement.dataset.type = item.type;

                if (item.type === 'text') {
                    messageElement.dataset.text = item.text;
                } else if (item.type === 'file') {
                    messageElement.dataset.filename = item.filename;
                }

                const avatarElement = document.createElement('img');
                avatarElement.className = 'chat-message__avatar';
                avatarElement.src = '../assets/WebChat.png'; // 头像图片地址

                if (item.type === 'text') {
                    const textElement = document.createElement('div');
                    textElement.className = 'chat-message__text';
                    textElement.textContent = item.text;
                    messageElement.appendChild(avatarElement);
                    messageElement.appendChild(textElement);
                } else if (item.type === 'file') {
                    const fileElement = document.createElement('div');
                    fileElement.className = 'chat-message__file';

                    const fileType = item.filename.split('.').pop().toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
                        const imgElement = document.createElement('img');
                        imgElement.className = 'chat-message__file-image';
                        imgElement.src = 'files/' + item.filename; // 直接使用src
                        imgElement.style.cursor = 'pointer';
                        imgElement.onclick = () => window.open('files/' + item.filename, '_blank');
                        fileElement.appendChild(imgElement);
                    } else {
                        const linkElement = document.createElement('a');
                        linkElement.className = 'chat-message__file-link';
                        linkElement.href = 'files/' + item.filename;
                        linkElement.target = '_blank';
                        linkElement.textContent = item.filename;

                        const fileIconElement = document.createElement('img');
                        fileIconElement.className = 'chat-message__file-icon';
                        fileIconElement.src = './assets/file.png'; // 文件图标地址
                        fileIconElement.style.marginLeft = '5px';

                        fileElement.appendChild(fileIconElement);
                        fileElement.appendChild(linkElement);
                    }

                    messageElement.appendChild(avatarElement);
                    messageElement.appendChild(fileElement);
                }

                chatMessages.appendChild(messageElement);
            });

            // 超文本转换
            convertLinksToHyperlinks();
            // cookie
            // index.js
            $(document).ready(function() {
                // 读取cookie
                function getCookie(name) {
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2) return parts.pop().split(';').shift();
                }
            
                // 检查是否开启右键删除消息功能
                const enableRightClickDelete = getCookie('enableRightClickDelete') === 'true';
            
                // 如果cookie不存在，设置默认值为true
                if (getCookie('enableRightClickDelete') === undefined) {
                    document.cookie = "enableRightClickDelete=true; path=/";
                    //alert("Cookie 'enableRightClickDelete' 不存在，已设置为默认值 true");
                    Adddeletebutton();
                } else {
                   // alert(getCookie('enableRightClickDelete'));
                    if (enableRightClickDelete) {
                        // 开启右键删除消息功能
                        // 添加右键删除功能
                        Adddeletebutton();
                    } else {
                        // 关闭右键删除消息功能
                        // 在这里添加您的关闭右键删除消息功能的代码
                    }
                }
            });
            
            //END

            // 确保在所有消息都添加到DOM之后再执行滚动操作
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 0);

            // 重新绑定双击事件
            enableDoubleClickCopy();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
function isPhone() {
    var browser = {
        versions: function() {
            var u = navigator.userAgent, app = navigator.appVersion;
            return { // 移动终端浏览器版本信息
                trident: u.indexOf('Trident') > -1, // IE内核
                presto: u.indexOf('Presto') > -1, // opera内核
                webKit: u.indexOf('AppleWebKit') > -1, // 苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, // 火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), // 是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), // ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, // android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1, // 是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, // 是否iPad
                webApp: u.indexOf('Safari') == -1, // 是否web应该程序，没有头部与底部
                weixin: u.indexOf('MicroMessenger') > -1, // 是否微信
                qq: u.match(/\sQQ/i) == " qq", // 是否QQ
                huawei: u.indexOf('Huawei') > -1 || u.indexOf('Honor') > -1, // 是否华为
                xiaomi: u.indexOf('MI') > -1 || u.indexOf('Redmi') > -1, // 是否小米
                samsung: u.indexOf('Samsung') > -1, // 是否三星
                redmi: u.indexOf('Redmi') > -1 // 是否红米
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    }

    if (browser.versions.mobile || browser.versions.ios || browser.versions.android ||
        browser.versions.iPhone || browser.versions.iPad || browser.versions.huawei ||
        browser.versions.xiaomi || browser.versions.samsung || browser.versions.redmi) {
        return true;
    } else {
        return false;
    }
}



function Adddeletebutton() {
    // 添加右键删除功能
    if (isPhone()) {
        return;
    }
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        const target = event.target.closest('.chat-message');
        if (target) {
            const confirmDelete = confirm('确定要删除这条消息吗？');
            if (confirmDelete) {
                deleteMessage(target);
            }
        } else {
            console.log('No message selected');
        }
    });
}

function deleteMessage(messageElement) {
    const timestamp = messageElement.dataset.timestamp;
    const type = messageElement.dataset.type;
    const data = { timestamp: timestamp };

    if (type === 'text') {
        data.text = messageElement.dataset.text;
    } else if (type === 'file') {
        data.filename = messageElement.dataset.filename;
    } else {
        console.error('Unknown message type:', type);
        return;
    }

    fetch(`delete_${type}.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        if (data.status === 'success') {
            messageElement.remove();
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
function hideH1OnMobile() {
    const h1Element = document.getElementById('Welcome');
   isPhone1 = isPhone()
  // alert('s')
        if (isPhone1) {
            h1Element.style.display = 'none';
        } else {
            h1Element.style.display = 'block';
        }
    }
function enableDoubleClickCopy() {
    const chatMessages = document.querySelectorAll('.chat-message');

    chatMessages.forEach(message => {
        message.removeEventListener('dblclick', handleDoubleClick); // 移除旧的事件监听器
        message.addEventListener('dblclick', handleDoubleClick); // 添加新的事件监听器
    });
}

function handleDoubleClick(event) {
    //alert('双击复制');
    const textElement = event.currentTarget.querySelector('.chat-message__text');
    if (textElement) {
        const textToCopy = textElement.textContent.trim();
        if (textToCopy) {
            copyToClipboard(textToCopy);
            alert('复制成功！');
        }
    }
}

function copyToClipboard(text) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
}

// 在页面加载完成后调用该函数
window.onload = function() {
    loadAllHistory();
    enableDoubleClickCopy();
    hideH1OnMobile();
};
