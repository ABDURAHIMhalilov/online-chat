const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

// Set up connection to PostgreSQL database
const db = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'FREEFREEf1',
  database: 'postgres',
  port: 5432
});

// Store chat history and group IDs
let chatHistory = {};
let groupIDs = {};

// Routes for user registration and login
app.post('/register', async (req, res) => {
  const { username, password,email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db.query('INSERT INTO users (username, password,email) VALUES ($1, $2,$3)', [username, hashedPassword,email]);
    res.status(201).send('User created');
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        res.status(200).send({ id: user.id });
      } else {
        res.status(401).send('Invalid credentials');
      }
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    res.status(500).send('Error logging in');
  }
});

// Authenticate users when connecting to socket.io server
io.use(async (socket, next) => {
  const userID = socket.handshake.auth.userID;
  if (!userID) {
    return next(new Error('Invalid credentials'));
  }
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userID]);
    if (result.rows.length > 0) {
      socket.userID = userID;
      next();
    } else {
      next(new Error('Invalid credentials'));
    }
  } catch (err) {
    next(new Error('Error authenticating user'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Assign client to group
  groupIDs[socket.id] = 'group1';
  socket.join('group1');

  // Send chat history to client
  socket.emit('chat_history', chatHistory['group1'] || []);

  // Listen for send_message event from client
  socket.on('send_message', (data) => {
    // Add timestamp to message
    data.message.timestamp = new Date();
    // Add user ID to message
    data.message.userID = socket.id;
    // Add readBy field to message
    data.message.readBy = [];
    // Add unique message ID
    data.message.id = Date.now();
  
    // Save message to chat history
    let groupID = groupIDs[socket.id];
    if (!chatHistory[groupID]) {
      chatHistory[groupID] = [];
    }
    chatHistory[groupID].push(data.message);
    // Broadcast message to all clients in room
    io.to(groupID).emit('receive_message', data);
  });
  
  // Listen for join_room event from client
  socket.on('join_room', (data) => {
    // Join room
    let groupID = data.room;
    groupIDs[socket.id] = groupID;
    socket.join(groupID);

    // Send chat history to client
    socket.emit('chat_history', chatHistory[groupID] || []);
  });

  // Listen for read_message event from client
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
  console.log('Server started');
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
