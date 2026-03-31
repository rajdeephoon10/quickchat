const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { randomUUID } = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('join', (username) => {
    socket.data.username = username || 'Anonymous';

    socket.broadcast.emit('system_message', {
      text: `${socket.data.username} joined the chat.`
    });

    socket.emit('system_message', {
      text: `Welcome, ${socket.data.username}!`
    });
  });

  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('typing', {
      username: socket.data.username || 'Anonymous',
      isTyping
    });
  });

  socket.on('chat_message', (text) => {
    const message = {
      id: randomUUID(),
      username: socket.data.username || 'Anonymous',
      text,
      timestamp: new Date().toISOString()
    };

    io.emit('chat_message', message);
  });

  socket.on('disconnect', () => {
    if (socket.data.username) {
      socket.broadcast.emit('system_message', {
        text: `${socket.data.username} left the chat.`
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
});
