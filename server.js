const express = require('express');
const app = express();
app.use(express.json());
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');
const mysql = require('mysql2');
require('dotenv').config();

const publicDirectory = path.join(__dirname, './public')
app.use(express.static(publicDirectory));

// Parses URL encoded bodies delivered by the HTML forms
app.use(express.urlencoded({ extended: false}));
// Parses JSON bodies as delivered by API clients
app.use(express.json());

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Define Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'));

/*----------
Database
----------*/
//Create a connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

//Connect to the database
db.connect((error) => {
    if (error) {
      console.error(error);
    } else {
      console.log('MySQL database connected successfully');
    }
  });

module.exports = db;

/*----------
Socket.io
----------*/
io.on('connect', (socket) => {
  //console.log('a user connected');
  socket.on('join', (data) => {
    socket.join(data.room);
    console.log('a user has joined');
    io.in(data.room).emit('chat message', `New person joined the ${data.room} room`)
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', (data) => {
    console.log('message: ' + data.msg);
    io.in(data.room).emit('chat message', data.msg);
  });

  socket.on('video file', (data) => {
    //Broadcast a 'video file' event to all clients in the room, along with the file data
    const { file, room } = data;
    io.to(room).emit('video file', file);
  });

  socket.on('video time update', (data) => {
    const { time, room } = data;
    //Update the time of the video for all clients
    console.log("video time update", data);
    io.to(room).emit('video time update', {time});
  });

  socket.on('video pause', (data) => {
    const { time, room } = data;
    //Pause the video for all clients
    io.to(room).emit('video time update', {time});
    io.in(data.room).emit('video pause');
  });

  socket.on('video play', (data) => {
    //Play the video for all clients
    const { time, room } = data;
    io.to(room).emit('video time update', {time});
    io.in(data.room).emit('video play');
  });
  
});

/*----------
OpenAI
----------*/

const { Configuration, OpenAIApi } = require('openai');


const config = new Configuration({
  apiKey: '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',
})
/*
const openai = new OpenAIApi(config);

app.post('/chatgpt', async (req, res) => {
  const prompt = req.body.prompt;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 2048,
    temperature: 1,
  });

  res.json({
    response: response.data.choices[0].text
  });
});
*/

server.listen(3000, () => {
  console.log('listening on *:3000');
});