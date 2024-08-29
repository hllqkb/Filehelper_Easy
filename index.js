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
            // 添加右键删除功能
            Adddeletebutton();

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

function Adddeletebutton() {
    // 添加右键删除功能
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
    var info = navigator.userAgent;
    //通过正则表达式的test方法判断是否包含“Mobile”字符串
    var isPhone = /mobile/i.test(info);

        if (isPhone) {
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
    const textElement = event.currentTarget.querySelector('.chat-message__text');
    if (textElement) {
        const textToCopy = textElement.textContent.trim();
        if (textToCopy) {
            copyToClipboard(textToCopy);
            alert('复制成功！');
        }
    }
}

function handleTouch(event) {
    const textElement = event.currentTarget.querySelector('.chat-message__text');
    if (textElement) {
        const textToCopy = textElement.textContent.trim();
        if (textToCopy) {
            copyToClipboard(textToCopy);
            alert('复制成功！');
        }
    }
}

function enableDoubleClickCopy() {
    const chatMessages = document.querySelectorAll('.chat-message');

    chatMessages.forEach(message => {
        message.removeEventListener('dblclick', handleDoubleClick); // 移除旧的双击事件监听器
        message.addEventListener('dblclick', handleDoubleClick); // 添加新的双击事件监听器
        message.removeEventListener('touchstart', handleTouch); // 移除旧的触摸事件监听器
        message.addEventListener('touchstart', handleTouch); // 添加新的触摸事件监听器
    });
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
