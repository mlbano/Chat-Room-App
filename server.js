const express = require('express');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const SERVER_PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Dummy database for storing user information
const users = [];

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Signup endpoint
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  
  // Check if the username is already taken
  if (users.some(user => user.username === username)) {
    return res.status(400).send('Username already taken');
  }

  // Store user information (in-memory, you'd want a database in production)
  users.push({ username, password });

  res.send('Signup successful');
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password match
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).send('Invalid credentials');
  }

  res.send('Login successful');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// App setup
const app = express()
app.use(express.static('views'))

// Start Server 
const server = app.listen(SERVER_PORT, () => {
    console.log(`Server started at http://localhost:${SERVER_PORT}/`)
})

//Socket setup
const serverIO = socketIO(server);

serverIO.on('connection', (socket) => {
    console.log('Socket connection made', socket.id);
    // socket.send('Hello from server!'); // Send to all clients "message" events
    socket.emit('message', 'Hello from server!'); // Send to only this client "message" events
    socket.on('message', (data) => {
        console.log(`Server : ${data}`);
    })

    socket.on('chat', (data) => {
        //serverIO.sockets.emit('chat', data);
        // console.log(JSON.stringify(serverIO.sockets));
        // serverIO.sockets.emit('new_chat_message', data);
        socket.broadcast.emit('new_chat_message', data);
        //socket.emit('new_chat_message', data);
        console.log(data);
    })

    socket.on('join_group', (groupName) => {
        socket.join(groupName);
        console.log(`Joined group ${groupName}`);
    })

    socket.on('group_chat', (data) => {
        serverIO.to(data.groupName).emit('new_group_message', data);
        console.log(data);
    })

    socket.on('leave_group', (groupName) => {
        socket.leave(groupName);
        console.log(`Left group ${groupName}`);
    })
})
