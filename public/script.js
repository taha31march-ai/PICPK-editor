const chatBox = document.getElementById('chat-box');
const fileInput = document.getElementById('file-input');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');

function appendMessage(sender, text, imageUrl = null) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    
    if (text) {
        msgDiv.innerText = text;
    }

    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('chat-image');
        msgDiv.appendChild(document.createElement('br'));
        msgDiv.appendChild(img);
    }

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle File Upload
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    appendMessage('user', `Uploaded: ${file.name}`);

    const formData = new FormData();
    formData.append('photo', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        appendMessage('bot', data.message, data.imageUrl);
    } catch (error) {
        appendMessage('bot', 'Error uploading image.');
    }
});

// Handle Text Commands
sendBtn.addEventListener('click', sendCommand);
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendCommand();
});

async function sendCommand() {
    const text = textInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    textInput.value = '';

    try {
        const response = await fetch('/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: text.toLowerCase() })
        });
        const data = await response.json();
        
        appendMessage('bot', data.reply, data.imageUrl);
    } catch (error) {
        appendMessage('bot', 'Error processing command.');
    }
                                     }
