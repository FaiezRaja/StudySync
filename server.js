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
const cookieParser = require('cookie-parser');

const publicDirectory = path.join(__dirname, './public')
app.use(express.static(publicDirectory));

//Parses URL encoded bodies delivered byHTML forms
app.use(express.urlencoded({ extended: true}));
//Parses JSON bodies as delivered by API clients
app.use(express.json());
app.use(cookieParser());

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//Define Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'));

/*----------
Database
----------*/
//Create a connection to database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

//Connect to database
db.ping((error, result) => {
    if (error) {
      console.log('Error pinging MySQL server:', err.message);
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
    console.log(data)
    socket.join(data.room);
    console.log('a user has joined');
    io.in(data.room).emit('chat message', `${data.username} has joined the ${data.room} room`)
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', (data) => {
    console.log('message: ' + data.msg);
    io.in(data.room).emit('chat message', data.msg);
  });

  socket.on('video file', (data) => {
    //Broadcast a 'video file' event to all clients in room, along with file data
    const { file, room } = data;
    io.to(room).emit('video file', file);
  });

  socket.on('video time update', (data) => {
    const { time, room } = data;
    //Update time of video for all clients
    console.log("video time update", data);
    io.to(room).emit('video time update', {time});
  });

  socket.on('video pause', (data) => {
    const { time, room } = data;
    //Pause video for all clients
    io.to(room).emit('video time update', {time});
    io.in(data.room).emit('video pause');
  });

  socket.on('video play', (data) => {
    //Play video for all clients
    const { time, room } = data;
    io.to(room).emit('video time update', {time});
    io.in(data.room).emit('video play');
  });
  
  socket.on('start timer', (data) => {
    //Get current time
    const now = Date.now();
    //Set end time of timer
    const endTime = now + data.hours * 3600000 + data.minutes * 60000 + data.seconds * 1000;
    //Broadcast end time to all clients in same room
    io.to(data.room).emit('timer update', { endTime });
    //Start timer on server side
    const timer = setInterval(() => {
      const remainingTime = Math.max(endTime - Date.now(), 0);
      if (remainingTime <= 0) {
        clearInterval(timer);
      }
      //Broadcast remaining time to all clients in same room
      io.to(data.room).emit('timer update', { remainingTime });
    }, 1000);
  });

  //Listen for 'add item' event
  socket.on('add item', (data) => {
    //Broadcast 'add item' event to all clients in room
    io.to(data.room).emit('add item', data.item);
  });

  //Listen for 'remove item' event
  socket.on('remove item', (data) => {
    //Broadcast 'remove item' event to all clients in room
    io.to(data.room).emit('remove item', data.item);
  });

  socket.on('update iframe', function(data) {
    //Broadcast 'update iframe' event to all other clients in same room
    io.to(data.room).emit('update iframe', data.link);
  });

  socket.on('pdf file', (data) => {
    // Broadcast the PDF file data to all clients in the specified room
    io.to(data.room).emit('pdf file', { file: data.file });
  });  

  /*socket.on('draw line', (data) => {
    //Broadcast 'draw line' event to all other clients in the same room
    socket.to(data.room).emit('draw line', data);
  });*/

  socket.on('drawing', (data) => {
    io.to(data.room).emit('drawing', data);
  });

});

//ObjectNull
function filterConsoleLog() {
  var nativeConsoleLog = console.log;
  console.log = function() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length === 1 && typeof args[0] === "object" && args[0] !== null && !Object.getPrototypeOf(args[0])) {
      // Ignore objects with null prototype
      return;
    }
    nativeConsoleLog.apply(console, args);
  };
}

filterConsoleLog();



/*----------
OpenAI
----------*/

const { Configuration, OpenAIApi } = require('openai');

const config = new Configuration({
  apiKey: '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', 
})

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


server.listen(3000, () => {
  console.log('listening on *:3000');
});