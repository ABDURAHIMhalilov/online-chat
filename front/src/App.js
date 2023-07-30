import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001', { autoConnect: false });

function App() {
  const [userID, setUserID] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatPartner, setChatPartner] = useState('');
  const [users, setUsers] = useState([]);
  const messageRefs = useRef([]);

  useEffect(() => {
    // Listen for chat_history event from server
    socket.on('chat_history', (data) => {
      setMessages(data);
    });
    // Listen for receive_message event from server
    socket.on('receive_message', (data) => {
      setMessages((messages) => [...messages, data.message]);
    });
    // Listen for update_message event from server
    socket.on('update_message', (data) => {
      setMessages((messages) => messages.map((message) => message.id === data.message.id ? data.message : message));
    });
    // Listen for users event from server
    socket.on('users', (data) => {
      setUsers(data);
    });
    // Clean up event handlers when component unmounts
    return () => {
      socket.off('chat_history');
      socket.off('receive_message');
      socket.off('update_message');
      socket.off('users');
    };
  }, []);

  useEffect(() => {
    // Set user ID
    setUserID(socket.id);
  }, []);

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        alert('User registered successfully!');
      } else {
        alert('Error registering user');
      }
    } catch (err) {
      alert('Error registering user');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        setUserID(data.id);
        setUsername(username);
        socket.auth = { userID: data.id };
        socket.connect();
        alert('User logged in successfully!');
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      alert('Error logging in');
    }
  };

  const handleSendMessage = () => {
    // Send message to server
    socket.emit('send_message', { message: { text: message, username } });
    setMessage('');
  };

  const handleReadMessage = (messageID) => {
    // Send read_message event to server
    socket.emit('read_message', { messageID });
  };

  const handleJoinRoom = () => {
    // Send join_room event to server
    socket.emit('join_room', { room: chatPartner });
  };

  return (
    <div className="app">
      <h1>Чат</h1>
      <div className="auth-container">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleRegister}>Регистрация</button>
        <button onClick={handleLogin}>Вход</button>
      </div>
      {userID && <p>Вы вошли как: {username}</p>}
      <div className="users-container">
        <h2>Пользователи</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.username}
              <button onClick={() => setChatPartner(user.id)}>Выбрать</button>
            </li>
          ))}
        </ul>
        <button onClick={handleJoinRoom}>Присоединиться к комнате</button>
      </div>
      <ul className="messages">
        {messages.map((message, index) => (
          <li key={index} ref={(el) => messageRefs.current[index] = el} data-userid={message.username === username ? 'own' : 'other'}>
            <p>{message.username}: {message.text} ({new Date(message.timestamp).toLocaleString()})</p>
            <br />
            {/* {message.userID === userID && <p>Read by: {message.readBy.length}</p>}
            {message.userID !== userID && <button onClick={() => handleReadMessage(message.id)}>прочитал</button>} */}
            {message.username === username && <p>Read by: {message.readBy.length}</p>}
            {message.username !== username && <button onClick={() => handleReadMessage(message.id)}>прочитал</button>}
          </li>
        ))}
      </ul>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Отправить</button>
      </div>
    </div>
  );
}

export default App;


// import React, { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';
// import './App.css';

// const socket = io('http://localhost:3001', { autoConnect: false });

// function App() {
//   const [userID, setUserID] = useState(null);
//   const [username, setUsername] = useState('');
//   const [email, setUsername2] = useState('zafargmail3');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [chatPartner, setChatPartner] = useState('');
//   const [users, setUsers] = useState([]);
//   const messageRefs = useRef([]);

//   useEffect(() => {
//     // Listen for chat_history event from server
//     socket.on('chat_history', (data) => {
//       setMessages(data);
//     });
//     // Listen for receive_message event from server
//     socket.on('receive_message', (data) => {
//       setMessages((messages) => [...messages, data.message]);
//     });
//     // Listen for update_message event from server
//     socket.on('update_message', (data) => {
//       setMessages((messages) => messages.map((message) => message.id === data.message.id ? data.message : message));
//     });
//     // Listen for users event from server
//     socket.on('users', (data) => {
//       setUsers(data);
//       console.log(data,"aaaaaaaaaaaaaaaa");
//     });
//     // Clean up event handlers when component unmounts
//     return () => {
//       socket.off('chat_history');
//       socket.off('receive_message');
//       socket.off('update_message');
//       socket.off('users');
//     };
//   }, []);

//   useEffect(() => {
//     // Set user ID
//     setUserID(socket.id);
//   }, []);

//   const handleRegister = async () => {
//     try {
//       const response = await fetch('http://localhost:3001/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password,email }),
//       });
//       if (response.ok) {
//         alert('User registered successfully!');
//       } else {
//         alert('Error registering user');
//       }
//     } catch (err) {
//       alert('Error registering user');
//     }
//   };

//   const handleLogin = async () => {
//     try {
//       const response = await fetch('http://localhost:3001/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password }),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setUserID(data.id);
//         socket.auth = { userID: data.id };
//         socket.connect();
//         alert('User logged in successfully!');
//       } else {
//         alert('Invalid credentials');
//       }
//     } catch (err) {
//       alert('Error logging in');
//     }
//   };

//   const handleSendMessage = () => {
//     // Send message to server
//     socket.emit('send_message', { message: { text: message } });
//     setMessage('');
//   };

//   const handleReadMessage = (messageID) => {
//     // Send read_message event to server
//     socket.emit('read_message', { messageID });
//   };

//   const handleJoinRoom = () => {
//     // Send join_room event to server
//     socket.emit('join_room', { room: chatPartner });
//   };

//   return (
//     <div className="app">
//       <h1>Чат</h1>
//       <div className="auth-container">
//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button onClick={handleRegister}>Регистрация</button>
//         <button onClick={handleLogin}>Вход</button>
//       </div>
//       {userID && <p>Вы вошли как: {username}</p>}
//       <div className="users-container">
//         <h2>Пользователи</h2>
//         <ul>
//           {users.map((user) => (
//             <li key={user.id}>
//               {user.username}
//               <button onClick={() => setChatPartner(user.id)}>Выбрать</button>
//             </li>
//           ))}
//         </ul>
//         <button onClick={handleJoinRoom}>Присоединиться к комнате</button>
//       </div>
//       <ul className="messages">
//         {messages.map((message, index) => (
//           <li key={index} ref={(el) => messageRefs.current[index] = el} data-userid={message.userID === userID ? 'own' : 'other'}>
//             <p>{message.userID}: {message.text} ({new Date(message.timestamp).toLocaleString()})</p>
//             <br />
//             {message.userID === userID && <p>Read by: {message.readBy.length}</p>}
//             {message.userID !== userID && <button onClick={() => handleReadMessage(message.id)}>прочитал</button>}
//           </li>
//         ))}
//       </ul>
//       <div className="input-container">
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//         />
//         <button onClick={handleSendMessage}>Отправить</button>
//       </div>
//     </div>
//   );
// }

// export default App;















// import React, { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';
// import './App.css';

// const socket = io('http://localhost:3000', { autoConnect: false });

// function App() {
//   const [userID, setUserID] = useState(null);
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('zafaremail');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [chatPartner, setChatPartner] = useState('');
//   const [users, setUsers] = useState([]);
//   const messageRefs = useRef([]);

//   useEffect(() => {
//     // Listen for chat_history event from server
//     socket.on('chat_history', (data) => {
//       setMessages(data);
//     });
//     // Listen for receive_message event from server
//     socket.on('receive_message', (data) => {
//       setMessages((messages) => [...messages, data.message]);
//     });
//     // Listen for update_message event from server
//     socket.on('update_message', (data) => {
//       setMessages((messages) => messages.map((message) => message.id === data.message.id ? data.message : message));
//     });
//     // Listen for users event from server
//     socket.on('users', (data) => {
//       setUsers(data);
//     });
//     // Clean up event handlers when component unmounts
//     return () => {
//       socket.off('chat_history');
//       socket.off('receive_message');
//       socket.off('update_message');
//       socket.off('users');
//     };
//   }, []);

//   useEffect(() => {
//     // Set user ID
//     setUserID(socket.id);
//   }, []);

//   const handleRegister = async () => {
//     try {
//       const response = await fetch('http://localhost:3001/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password,email }),
//       });
//       if (response.ok) {
//         alert('User registered successfully!');
//       } else {
//         alert('Error registering user');
//       }
//     } catch (err) {
//       alert('Error registering user dd');
//     }
//   };

//   const handleLogin = async () => {
//     try {
//       const response = await fetch('http://localhost:3001/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password }),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setUserID(data.id);
//         socket.auth = { userID: data.id };
//         socket.connect();
//         alert('User logged in successfully!');
//       } else {
//         alert('Invalid credentials');
//       }
//     } catch (err) {
//       alert('Error logging in');
//     }
//   };

//   const handleSendMessage = () => {
//     // Send message to server
//     socket.emit('send_message', { message: { text: message } });
//     setMessage('');
//   };

//   const handleReadMessage = (messageID) => {
//     // Send read_message event to server
//     socket.emit('read_message', { messageID });
//   };

//   const handleJoinRoom = () => {
//     // Send join_room event to server
//     socket.emit('join_room', { room: chatPartner });
//   };

//   return (
//     <div className="app">
//       <h1>Чат</h1>
//       <div className="auth-container">
//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button onClick={handleRegister}>Регистрация</button>
//         <button onClick={handleLogin}>Вход</button>
//       </div>
//       <div className="users-container">
//         <h2>Пользователи</h2>
//         <ul>
//           {users.map((user) => (
//             <li key={user.id}>
//               {user.username}
//               <button onClick={() => setChatPartner(user.id)}>Выбрать</button>
//             </li>
//           ))}
//         </ul>
//         <button onClick={handleJoinRoom}>Присоединиться к комнате</button>
//       </div>
//       <ul className="messages">
//         {messages.map((message, index) => (
//           <li key={index} ref={(el) => messageRefs.current[index] = el} data-userid={message.userID === userID ? 'own' : 'other'}>
//             <p>{message.userID}: {message.text} ({new Date(message.timestamp).toLocaleString()})</p>
//             <br />
//             {message.userID === userID && <p>Read by: {message.readBy.length}</p>}
//             {message.userID !== userID && <button onClick={() => handleReadMessage(message.id)}>прочитал</button>}
//           </li>
//         ))}
//       </ul>
//       <div className="input-container">
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//         />
//         <button onClick={handleSendMessage}>Отправить</button>
//       </div>
//     </div>
//   );
// }

// export default App;






// import React, { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';
// import "./App.css"
// const socket = io('http://localhost:3001');
// function App() {
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const messageRefs = useRef([]);

//   useEffect(() => {
//     // Слушайте событие chat_history от сервера
//     socket.on('chat_history', (data) => {
//       setMessages(data);
//       console.log(data);
//     });
//     // Слушайте событие receive_message от сервера
//     socket.on('receive_message', (data) => {
//       setMessages((messages) => [...messages, data.message]);
//     });
//     // Очистка обработчиков событий при размонтировании компонента
//     return () => {
//       socket.off('chat_history');
//       socket.off('receive_message');
//     };
//   }, []);
  
//   const handleSendMessage = () => {
//     // Отправка сообщения на сервер
//     socket.emit('send_message', { message: { text: message } });
//     setMessage('');
//   };
  
  

  
//   return (
//     <div>
//       <h1>Чат</h1>
//       <ul>
//         {messages.map((message, index) => (
//           <li key={index} ref={(el) => messageRefs.current[index] = el}>
//             <p><span>User:   </span>{message.userID}</p>: {message.text} ({new Date(message.timestamp).toLocaleString()})
//             <br />
//           </li>
//         ))}
//       </ul>
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//       />
//       <button onClick={handleSendMessage}>Отправить</button>
//     </div>
//   );
// }
// export default App;

