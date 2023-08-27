const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["POST", "POST"],
  },
});
const messageList = [];
io.on("connection", (socket) => {



  
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    if(data.message){
      messageList.push(data.message);
      console.log(data);
      socket.in(data.room).emit("receive_message", {message : JSON.stringify(messageList), room: data.room});
    }else{
      socket.in(data.room).emit("blank_message", "");
    }
  });

});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
