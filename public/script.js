const socket = io();
let currentRoom = '';
let typingTimeout;

function startChat() {
  const username = document.getElementById('username').value;
  if (username.trim() === '') {
    return;
  }

  socket.emit('setUsername', username);

  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('chatScreen').style.display = 'block';

  const createRoomButton = document.createElement('button');
  createRoomButton.id = 'createRoom';
  createRoomButton.innerText = 'Create Room';
  createRoomButton.onclick = () => {
    const roomName = prompt('Enter room name:');
    if (roomName) {
      socket.emit('createRoom', roomName);
    }
  };

  document.getElementById('roomList').appendChild(createRoomButton);

  socket.on('updateRooms', (roomNames) => {
    updateRoomList(roomNames);
  });

  joinRoom('lobby');
}

function updateRoomList(roomNames) {
  const roomList = document.getElementById('roomList');
  roomList.innerHTML = 'Rooms: ';

  if (roomNames.length === 0) {
    roomList.innerHTML += 'No rooms available.';
  } else {
    roomNames.forEach(roomName => {
      const roomLink = document.createElement('a');
      roomLink.href = `#${roomName}`;
      roomLink.innerText = roomName;
      roomLink.onclick = () => {
        joinRoom(roomName);
      };
      roomList.appendChild(roomLink);
    });
  }
}

function joinRoom(roomName) {
  if (roomName === currentRoom) {
    return;
  }

  if (currentRoom !== '') {
    socket.emit('leaveRoom', currentRoom);
  }

  socket.emit('joinRoom', roomName);
  currentRoom = roomName;

  const chat = document.getElementById('chat');
  chat.innerHTML = '';

  socket.on('receiveMessage', (data) => {
    displayMessage(data);
  });

  socket.on('userTyping', (username) => {
    document.getElementById('typingIndicator').innerText = `${username} is typing...`;
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      document.getElementById('typingIndicator').innerText = '';
    }, 3000);
  });

  const roomLinks = document.querySelectorAll('#roomList a');
  roomLinks.forEach(link => {
    link.classList.remove('active');
  });
  const activeLink = document.querySelector(`#roomList a[href="#${roomName}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

function leaveRoom() {
  socket.emit('leaveRoom', currentRoom);
  currentRoom = '';
  const chat = document.getElementById('chat');
  chat.innerHTML = '';
}

function sendMessage() {
  const message = document.getElementById('message').value;
  if (message.trim() === '') {
    return;
  }

  socket.emit('sendMessage', {
    room: currentRoom,
    message: message
  });

  document.getElementById('message').value = '';
  document.getElementById('typingIndicator').innerText = '';
}

function displayMessage(data) {
  const chat = document.getElementById('chat');
  const messageElement = document.createElement('p');
  messageElement.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
  chat.appendChild(messageElement);
  chat.scrollTop = chat.scrollHeight;
}

document.getElementById('message').addEventListener('input', () => {
  socket.emit('typing', currentRoom);
});

socket.on('userTyping', (username) => {
  document.getElementById('typingIndicator').innerText = `${username} is typing...`;
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    document.getElementById('typingIndicator').innerText = '';
  }, 3000);
});
