var express = require('express');
var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

users = []

io.on('connection',function(socket){
    console.log("A users connected!");
    socket.broadcast.emit('newjoin');

    socket.on('send-nickname',function(nickname){
        socket.username = nickname;
        users.push(socket.username);
    });

    socket.on('disconnect',function(){
        console.log("A user disconnected!");
    });
    socket.on('chat message',function(data){
        socket.emit('chat message',"you say: "+data);
        socket.broadcast.emit('chat message',socket.username +" says : "+data);
    });
});

http.listen(8081);