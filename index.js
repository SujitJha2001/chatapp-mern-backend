const http = require("http");
const express = require("express");
const app = express();
const socketIO = require("socket.io");
const cors = require("cors");
require("dotenv").config()
app.use(cors())
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "*" } });

app.get("/",(req,res)=>{
    res.send("Hello from the server");
})
let users = new Map();
io.on("connection",(socket)=>{
    socket.on("joined",({user})=>{
        console.log(`Connected : ${user}-${socket.id}`)
        users.set(socket.id, user);
        socket.emit("welcome",{user:"Admin",message:`Welcome to the chat, ${users.get(socket.id)}`});
        socket.broadcast.emit("userJoined",{user:"Admin",message:`${users.get(socket.id)} has joined`});
    })
    socket.on("message",({message,id})=>{
        io.emit('sendMessage',{user:users.get(id),message,id})
    })
    socket.on("disconnect",()=>{
        console.log("user left : "+users.get(socket.id))
        socket.broadcast.emit("leave",{user:"Admin",message:`${users.get(socket.id)} has left`})
        users.delete(socket.id);
    })
})
server.listen(process.env.PORT || 4000, () => {
    console.log(`Server running on ${process.env.PORT || 4000}`)
})