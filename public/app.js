const socket = io();

const statusEl = document.getElementById('status');
const messagesEl = document.getElementById('messages');
const typingEl = document.getElementById('typing');
const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');

const username =
  prompt('Enter a username:')?.trim() || `Guest-${Math.floor(Math.random() * 1000)}`;

const typingUsers = new Set();
let typingTimer;

const scrollToBottom = () => {
  messagesEl.scrollTop = messagesEl.scrollHeight;
};

const formatTime = (isoString) =>
  new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

const addSystemMessage = (text) => {
  const el = document.createElement('p');
  el.className = 'system';
  el.textContent = text;
  messagesEl.append(el);
  scrollToBottom();
};

const addChatMessage = ({ username: from, text, timestamp }) => {
  const el = document.createElement('article');
  const isSelf = from === username;
  el.className = `message ${isSelf ? 'self' : ''}`;

  const meta = document.createElement('span');
  meta.className = 'message-meta';
  meta.textContent = `${from} · ${formatTime(timestamp)}`;

  const content = document.createElement('p');
  content.textContent = text;
  content.style.margin = '0';

  el.append(meta, content);
  messagesEl.append(el);
  scrollToBottom();
};

const updateTypingText = () => {
  if (typingUsers.size === 0) {
    typingEl.textContent = '';
    return;
  }

  typingEl.textContent =
    typingUsers.size === 1
      ? `${[...typingUsers][0]} is typing…`
      : `${typingUsers.size} people are typing…`;
};

socket.on('connect', () => {
  statusEl.textContent = `Connected as ${username}`;
  socket.emit('join', username);
});

socket.on('disconnect', () => {
  statusEl.textContent = 'Disconnected. Trying to reconnect…';
});

socket.on('system_message', ({ text }) => {
  addSystemMessage(text);
});

socket.on('chat_message', (message) => {
  addChatMessage(message);
});

socket.on('typing', ({ username: from, isTyping }) => {
  if (from === username) return;

  if (isTyping) {
    typingUsers.add(from);
  } else {
    typingUsers.delete(from);
  }

  updateTypingText();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  socket.emit('chat_message', text);
  input.value = '';
  socket.emit('typing', false);
});

input.addEventListener('input', () => {
  socket.emit('typing', true);

  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit('typing', false);
  }, 700);
});
