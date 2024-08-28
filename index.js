document.getElementById('messageInput').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault(); // 阻止默认的回车行为（如换行）
        sendMessage();
    }
});
//点击发送按钮
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
        avatarElement.src = 'https://res.wx.qq.com/a/wx_fed/assets/res/OTE0YTAw.png'; // 头像图片地址

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
    }
}
// function addDeleteButton(messageElement) {
//     const deleteButton = document.createElement('button');
//     deleteButton.className = 'chat-message__delete';
//     deleteButton.textContent = 'Delete';
//     deleteButton.onclick = () => deleteMessage(messageElement);

//     messageElement.appendChild(deleteButton);
// }

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
        avatarElement.src = 'https://res.wx.qq.com/a/wx_fed/assets/res/OTE0YTAw.png'; // 头像图片地址

        const textElement = document.createElement('div');
        textElement.className = 'chat-message__text';
        textElement.textContent = messageText;

        messageElement.appendChild(avatarElement);
        messageElement.appendChild(textElement);
        chatMessages.appendChild(messageElement);

        // 添加删除按钮
       // addDeleteButton(messageElement);

        // 发送文本到后端
        sendTextToServer(messageText);

        // 清空输入框
        messageInput.value = '';

        // 滚动到最新消息
        chatMessages.scrollTop = chatMessages.scrollHeight;
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
//文件上传
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        console.log('File selected:', file.name);
        uploadFile(file);
        
    } else {
        console.error('No file selected');
    }
});

function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('upload_file.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        loadAllHistory();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
   
}


function loadChatHistory() {
            // 超文本转换

    return fetch('load_texts.php')
        .then(response => response.json())
        .catch((error) => {
            console.error('Error:', error);
            return [];
        });
}

function loadFileHistory() {
            // 超文本转换

    return fetch('load_files.php')
        .then(response => response.json())
        .catch((error) => {
            console.error('Error:', error);
            return [];
        });
}

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
                avatarElement.src = 'https://res.wx.qq.com/a/wx_fed/assets/res/OTE0YTAw.png'; // 头像图片地址

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
                        imgElement.src = 'files/' + item.filename;
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

            // 滚动到最新消息
            chatMessages.scrollTop = chatMessages.scrollHeight;
                    // 超文本转换
                convertLinksToHyperlinks();
            //上面是加载历史消息的代码，下面是删除消息的代码
            // 添加右键删除功能
    Adddeletebutton();
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
        }
        else {
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
    }
    else {
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
//window.location.reload();
}

window.onload = function() {
    loadAllHistory();
};
