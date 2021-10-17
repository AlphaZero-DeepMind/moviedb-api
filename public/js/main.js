const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');

const socket = io();
socket.on('message', (message) => {
  showMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit('joinRoom', { room, username });

socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = document.getElementById('msg');
  socket.emit('chatMessage', message.value);

  message.value = '';
  message.focus();
});

const showMessage = (message) => {
  const newMessage = document.createElement('div');
  newMessage.classList.add('message');
  newMessage.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.message}
    </p>`;
  chatMessages.appendChild(newMessage);
};

const outputRoomName = (room) => {
  roomName.textContent = room;
};

const outputUsers = (users) => {
  usersList.innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join(' ')}`;
};
