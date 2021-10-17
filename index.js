const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));
const CHAT_BOT_NAME = 'ChatCord Bot';
// run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome current user
    socket.emit(
      'message',
      formatMessage(CHAT_BOT_NAME, 'Welcome to ChatCord!')
    );

    //   broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(CHAT_BOT_NAME, `${user.username} has joined the chat.`)
      );

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    //   listen for chat message
    socket.on('chatMessage', (message) => {
      const user = getCurrentUser(socket.id);

      io.to(user.room).emit('message', formatMessage(username, message));
    });

    //   runs when client disconnects
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);

      if (user) {
        io.emit(
          'message',
          formatMessage(CHAT_BOT_NAME, `${user.username} has left the chat.`)
        );

        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
