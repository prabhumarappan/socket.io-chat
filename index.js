var express = require('express');
var app = express();
var redis = require('redis');

var http = require('http').Server(app);

var io = require('socket.io')(http);

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

redis_client = redis.createClient();

messages = []
users = []

redis_client.get('messages',function(err,reply){
    if(reply){
        messages = JSON.parse(reply);
    }
});
redis_client.get('users',function(err,reply){
    if(reply){
        users = JSON.parse(reply);
    }
});

io.on('connection',function(socket){
    console.log("A users connected!");
    socket.broadcast.emit('newjoin',{});
    socket.on('ready',function(){
        socket.emit('chat message',messages);
    });

    socket.on('send-nickname',function(nickname){
        socket.username = nickname;
        users.push(socket.username);
        redis_client.set('users',JSON.stringify(users));
    });

    socket.on('disconnect',function(){
        console.log("A user disconnected!");
    });
    socket.on('chat message',function(data){
        person = socket.username;
        current_message  = {};
        current_message['user'] = person;
        current_message['message'] = data;
        new_message = [];
        new_message.push(current_message);
        messages.push(current_message);
        socket.broadcast.emit('chat message',new_message);
        redis_client.set('messages',JSON.stringify(messages));
    });
});

http.listen(8081);