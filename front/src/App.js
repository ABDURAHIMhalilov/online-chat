import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import "./App.css"
const socket = io('http://localhost:3001');
function App() {
  const [userID, setUserID] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messageRefs = useRef([]);

  useEffect(() => {
    // Слушайте событие chat_history от сервера
    socket.on('chat_history', (data) => {
      setMessages(data);
      console.log(data);
    });
    // Слушайте событие receive_message от сервера
    socket.on('receive_message', (data) => {
      setMessages((messages) => [...messages, data.message]);
    });
    // Слушайте событие update_message от сервера
    socket.on('update_message', (data) => {
      setMessages((messages) => messages.map((message) => message.id === data.message.id ? data.message : message));
    });
    // Очистка обработчиков событий при размонтировании компонента
    return () => {
      socket.off('chat_history');
      socket.off('receive_message');
      socket.off('update_message');
    };
  }, []);
  
  useEffect(() => {
    // Установка идентификатора пользователя
    setUserID(socket.id);
  }, []);
  
  const handleSendMessage = () => {
    // Отправка сообщения на сервер
    socket.emit('send_message', { message: { text: message } });
    alert(userID)
    setMessage('');
  };
  
  const handleReadMessage = (messageID) => {
    // Отправка события read_message на сервер
    socket.emit('read_message', { messageID });
  };
  
  return (
    <div className="app">
      <h1>Чат</h1>
      <ul className="messages">
        {messages.map((message, index) => (
    <li key={index} ref={(el) => messageRefs.current[index] = el} data-userid={message.userID === userID ? 'own' : 'other'}>
<p><span>User:   </span>{message.userID}: <p>{message.text}</p> ({new Date(message.timestamp).toLocaleString()})</p>

  <br />
  {message.userID === userID && <p>Read by: {message.readBy.length}</p>}
  {message.userID !== userID && <button onClick={() => handleReadMessage(message.id)}>прочитал</button>}
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

