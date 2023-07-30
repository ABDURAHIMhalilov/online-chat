const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

// Хранение истории чата и идентификаторов групп
let chatHistory = {};
let groupIDs = {};

io.on('connection', (socket) => {
  console.log(`Пользователь подключен: ${socket.id}`);

  // Назначение клиента группе
  groupIDs[socket.id] = 'group1';
  socket.join('group1');

  // Отправка истории чата клиенту
  socket.emit('chat_history', chatHistory['group1'] || []);

  // Слушайте событие send_message от клиента
  socket.on('send_message', (data) => {
    // Добавление даты и времени отправки сообщения
    data.message.timestamp = new Date();
    // Добавление идентификатора пользователя
    data.message.userID = socket.id;
    // Добавление поля readBy
    data.message.readBy = [];
    // Добавление уникального идентификатора сообщения
    data.message.id = Date.now();
  
    // Сохранение сообщения в истории чата
    let groupID = groupIDs[socket.id];
    if (!chatHistory[groupID]) {
      chatHistory[groupID] = [];
    }
    chatHistory[groupID].push(data.message);
    // Трансляция сообщения всем клиентам в комнате
    io.to(groupID).emit('receive_message', data);
  });
  
  // Слушайте событие join_room от клиента
  socket.on('join_room', (data) => {
    // Присоединение к комнате
    let groupID = data.room;
    groupIDs[socket.id] = groupID;
    socket.join(groupID);

    // Отправка истории чата клиенту
    socket.emit('chat_history', chatHistory[groupID] || []);
  });

  // Слушайте событие read_message от клиента
  socket.on('read_message', (data) => {
    let groupID = groupIDs[socket.id];
    let messageIndex = chatHistory[groupID].findIndex((message) => message.id === data.messageID);
    
    if (messageIndex !== -1) {
      chatHistory[groupID][messageIndex].readBy.push(socket.id);
      io.to(groupID).emit('update_message', { message: chatHistory[groupID][messageIndex] });
    }
  });
});

server.listen(3001, () => {
  console.log('Сервер запущен');
});




// const express = require('express');
// const app = express();
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// app.use(cors());

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
// });

// // Хранение истории чата и идентификаторов групп
// let chatHistory = {};
// let groupIDs = {};

// io.on('connection', (socket) => {
//   console.log(`Пользователь подключен: ${socket.id}`);

//   // Назначение клиента группе
//   groupIDs[socket.id] = 'group1';
//   socket.join('group1');

//   // Отправка истории чата клиенту
//   socket.emit('chat_history', chatHistory['group1'] || []);

//   // Слушайте событие send_message от клиента
//   socket.on('send_message', (data) => {
//     // Добавление даты и времени отправки сообщения
//     data.message.timestamp = new Date();
//     // Добавление идентификатора пользователя
//     data.message.userID = socket.id;
//     // Добавление поля readBy
//     data.message.readBy = [];
  
//     // Сохранение сообщения в истории чата
//     let groupID = groupIDs[socket.id];
//     if (!chatHistory[groupID]) {
//       chatHistory[groupID] = [];
//     }
//     chatHistory[groupID].push(data.message);
//     // Трансляция сообщения всем клиентам в комнате
//     io.to(groupID).emit('receive_message', data);
//   });
  
//   // Слушайте событие join_room от клиента
//   socket.on('join_room', (data) => {
//     // Присоединение к комнате
//     let groupID = data.room;
//     groupIDs[socket.id] = groupID;
//     socket.join(groupID);

//     // Отправка истории чата клиенту
//     socket.emit('chat_history', chatHistory[groupID] || []);
//   });
// });

// server.listen(3001, () => {
//   console.log('Сервер запущен');
// });
