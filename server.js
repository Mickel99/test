const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = {};

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  socket.on('setUsername', (username) => {
    socket.username = username;
  });

  socket.on('createRoom', (roomName) => {
    rooms[roomName] = [];
    io.emit('updateRooms', Object.keys(rooms));
  });

  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    socket.emit('receiveMessage', {
      username: 'System',
      message: `You've joined the room: ${roomName}`
    });
    socket.to(roomName).emit('receiveMessage', {
      username: 'System',
      message: `${socket.username} has joined the room.`
    });
  });

  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.room).emit('receiveMessage', {
      username: socket.username,
      message: data.message
    });
  });

  socket.on('typing', (roomName) => {
    socket.to(roomName).emit('userTyping', socket.username);
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
