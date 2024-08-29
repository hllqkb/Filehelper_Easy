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
                    Adddeletebutton();
                } else {
                    if (enableRightClickDelete) {
                        Adddeletebutton();
                    } else {
                        // 关闭右键删除消息功能
                    }
                }
            });

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
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function hideH1OnMobile() {
    const h1Element = document.getElementById('Welcome');
    const isPhone1 = isPhone();
    if (isPhone1) {
        h1Element.style.display = 'none';
    } else {
        h1Element.style.display = 'block';
    }
}


// 右键删除消息功能
function Adddeletebutton() {
    $(document).ready(function() {
        // 读取cookie
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }
    
        // 检查是否开启右键删除消息功能
        const enableRightClickDelete = getCookie('enableRightClickDelete') === 'true';
    
        if (enableRightClickDelete) {
            // 添加右键删除功能
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.addEventListener('contextmenu', function(event) {
                event.preventDefault();
                const target = event.target.closest('.chat-message');
                if (target) {
                    if (target.querySelector('.chat-message__text')) {
                        showTextDeleteConfirmationModal(target);
                    } else {
                        showSimpleDeleteConfirmationModal(target);
                    }
                } else {
                    console.log('No message selected');
                }
            });
        } else {
            // 关闭右键删除消息功能
            return;
        }
    });
}

function showTextDeleteConfirmationModal(messageElement) {
    const textElement = messageElement.querySelector('.chat-message__text');
    const textContent = textElement ? textElement.textContent.trim() : '';

    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'deleteConfirmationModal';
    modal.tabIndex = '-1';
    modal.role = 'dialog';
    modal.innerHTML = `
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">确认删除消息</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>您要删除这条消息确定吗？</p>
                    <textarea class="form-control" id="deleteMessageText" rows="3" style="white-space: pre-wrap;">${textContent}</textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-danger" id="confirmDeleteButton">确定</button>
                </div>
            </div>
        </div>
    `;

    // 将模态框添加到body
    document.body.appendChild(modal);

    // 显示模态框
    $('#deleteConfirmationModal').modal('show');

    // 确认删除按钮点击事件
    $('#confirmDeleteButton').on('click', function() {
        deleteMessage(messageElement);
        $('#deleteConfirmationModal').modal('hide');
    });

    // 模态框隐藏后移除
    $('#deleteConfirmationModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}

function showSimpleDeleteConfirmationModal(messageElement) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'simpleDeleteConfirmationModal';
    modal.tabIndex = '-1';
    modal.role = 'dialog';
    modal.innerHTML = `
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">确认删除消息</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>您确定要删除这条消息吗？</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-danger" id="simpleConfirmDeleteButton">确定</button>
                </div>
            </div>
        </div>
    `;

    // 将模态框添加到body
    document.body.appendChild(modal);

    // 显示模态框
    $('#simpleDeleteConfirmationModal').modal('show');

    // 确认删除按钮点击事件
    $('#simpleConfirmDeleteButton').on('click', function() {
        deleteMessage(messageElement);
        $('#simpleDeleteConfirmationModal').modal('hide');
    });

    // 模态框隐藏后移除
    $('#simpleDeleteConfirmationModal').on('hidden.bs.modal', function () {
        $(this).remove();
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
//END
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

//END
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
