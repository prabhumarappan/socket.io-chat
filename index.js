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
    socket.on('ready',function(){
        socket.emit('chat message',messages);
    });

    socket.on('send-nickname',function(nickname){
        socket.username = nickname;
        users.push(socket.username);
        console.log(nickname + " connected!");
        socket.broadcast.emit('newjoin',nickname);
        redis_client.set('users',JSON.stringify(users));
    });

    socket.on('typing',function(){
        socket.broadcast.emit('typing',socket.username+" is typing...");
    });

    socket.on('finished-typing',function(){
        socket.broadcast.emit('typing');
    })

    socket.on('disconnect',function(){
        console.log(socket.username+" disconnected!");
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