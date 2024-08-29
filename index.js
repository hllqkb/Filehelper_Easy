document.getElementById('messageInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // 阻止默认的回车行为（如换行）
        sendMessage();
    }
});

document.getElementById('sendButton').addEventListener('click', function() {
    sendMessage();
    convertLinksToHyperlinks();
});

function convertLinksToHyperlinks() {
    const divs = document.querySelectorAll('div.chat-message__text');
    divs.forEach(div => {
        const content = div.textContent.trim();
        const linkPattern = /^(https?:\/\/|www\.)[\w\d./?=#+-]+$/;
        if (linkPattern.test(content)) {
            const a = document.createElement('a');
            a.href = content.startsWith('www.') ? 'http://' + content : content;
            a.textContent = content;
            a.target = '_blank';
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
        const messageElement = createMessageElement(messageText);
        chatMessages.appendChild(messageElement);
        sendTextToServer(messageText);
        messageInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
        enableDoubleClickCopy();
    }
}

function createMessageElement(messageText) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.dataset.timestamp = new Date().getTime();
    messageElement.dataset.type = 'text';
    messageElement.dataset.text = messageText;

    const avatarElement = document.createElement('img');
    avatarElement.className = 'chat-message__avatar';
    avatarElement.src = '../assets/WebChat.png';

    const textElement = document.createElement('div');
    textElement.className = 'chat-message__text';
    textElement.textContent = messageText;

    messageElement.appendChild(avatarElement);
    messageElement.appendChild(textElement);
    return messageElement;
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

function loadAllHistory() {
    Promise.all([loadChatHistory(), loadFileHistory()])
        .then(([textData, fileData]) => {
            const chatMessages = document.getElementById('chatMessages');
            const combinedData = [
                ...textData.map(item => ({ ...item, type: 'text' })),
                ...fileData.map(item => ({ ...item, type: 'file' }))
            ];

            combinedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            combinedData.forEach(item => {
                const messageElement = document.createElement('div');
                messageElement.className = 'chat-message';
                messageElement.dataset.timestamp = item.timestamp;
                messageElement.dataset.type = item.type;

                const avatarElement = document.createElement('img');
                avatarElement.className = 'chat-message__avatar';
                avatarElement.src = '../assets/WebChat.png';

                if (item.type === 'text') {
                    messageElement.dataset.text = item.text;
                    const textElement = document.createElement('div');
                    textElement.className = 'chat-message__text';
                    textElement.textContent = item.text;
                    messageElement.appendChild(avatarElement);
                    messageElement.appendChild(textElement);
                } else if (item.type === 'file') {
                    messageElement.dataset.filename = item.filename;
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
                        fileIconElement.src = './assets/file.png';
                        fileIconElement.style.marginLeft = '5px';

                        fileElement.appendChild(fileIconElement);
                        fileElement.appendChild(linkElement);
                    }

                    messageElement.appendChild(avatarElement);
                    messageElement.appendChild(fileElement);
                }

                chatMessages.appendChild(messageElement);
            });

            convertLinksToHyperlinks();
            Adddeletebutton();

            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 0);

            enableDoubleClickCopy();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function Adddeletebutton() {
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
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= 600;

    if (isMobile && isSmallScreen) {
        h1Element.style.display = 'none';
    } else {
        h1Element.style.display = 'block';
    }
}

function enableDoubleClickCopy() {
    const chatMessages = document.querySelectorAll('.chat-message');

    chatMessages.forEach(message => {
        message.removeEventListener('dblclick', handleDoubleClick);
        message.addEventListener('dblclick', handleDoubleClick);
        message.removeEventListener('touchstart', handleTouch);
        message.addEventListener('touchstart', handleTouch);
    });
}

function handleDoubleClick(event) {
    copyText(event);
}

function handleTouch(event) {
    copyText(event);
}

function copyText(event) {
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

window.onload = function() {
    loadAllHistory();
    enableDoubleClickCopy();
    hideH1OnMobile();
};
