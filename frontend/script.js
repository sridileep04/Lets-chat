const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chat-container');
const askBtn = document.querySelector('#ask');

//const threadId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
const threadId = '1';

input.addEventListener('keyup', handleEnter);
askBtn.addEventListener('click', handleAsk);

const loading = document.createElement('div');
loading.className = `bg-neutral-700 text-white p-4 rounded-lg my-4 rounded-xl mr-auto max-w-fit`;
loading.textContent = 'Thinking...';

async function generate(text) {
    const msg = document.createElement('div');
    msg.className = `bg-neutral-800 text-white p-4 rounded-lg my-4 rounded-xl ml-auto max-w-fit`;
    msg.textContent = text;
    chatContainer.appendChild(msg);
    input.value = '';

    chatContainer.appendChild(loading);
    input.disabled = true;
    askBtn.disabled = true;
    askBtn.classList.add('opacity-50', 'cursor-not-allowed');
    askBtn.classList.remove('cursor-pointer');

    await callServer(text)
        .then((responseText) => {
            const botMsg = document.createElement('div');
            botMsg.className = `bg-neutral-700 text-white p-4 rounded-lg my-4 rounded-xl mr-auto max-w-fit`;
            botMsg.textContent = responseText;
            chatContainer.appendChild(botMsg);
        })
        .catch((error) => {
            const errorMsg = document.createElement('div');
            errorMsg.className = `bg-red-600 text-white p-4 rounded-lg my-4 rounded-xl mr-auto max-w-fit`;
            errorMsg.textContent = 'Error: ' + error.message;
            chatContainer.appendChild(errorMsg);
        })
        .finally(() => {
            loading.remove();
            input.disabled = false;
            askBtn.disabled = false;
            askBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            askBtn.classList.add('cursor-pointer');
            chatContainer.scrollTop = chatContainer.scrollHeight;
        });
}
async function handleEnter(event) {
    if (event.key === 'Enter') {
        const text = input.value.trim();
        if (!text) return;
        await generate(text);
    }
}
async function callServer(inputText) {
    const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threadId: threadId, message: inputText }),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.reply;
}
async function handleAsk(event) {
    const text = input.value.trim();
    if (!text) return;
    await generate(text);
}