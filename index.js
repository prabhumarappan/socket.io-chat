var express = require('express');
var app = express();
var redis = require('redis');

var http = require('http').Server(app);

var io = require('socket.io')(http);

global.room_name;

// app.get('',function(req,res){
//     // res.sendStatus(500);
//     res.send('Add a channel to the URL where you want to join!');
// });

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

redis_client = redis.createClient();

io.on('connection',function(socket){
    global.messages = [];
    global.users = [];

    socket.on('ready',function(message){
        socket.emit('chat message',messages);
        console.log()
    });

    socket.on('send-nickname',function(nickname){
        socket.username = nickname;
        users.push(socket.username);
        console.log(nickname + " connected!");
        var keys = Object.keys(socket.rooms);
        channel = socket.rooms[keys[1]];
        socket.broadcast.to(socket.rooms[keys[1]]).emit('newjoin',nickname);
        redis_client.set(channel+':users',JSON.stringify(users));
    });

    socket.on('join-channel',function(channel){
        socket.join(channel);
        //Load previous messages
        redis_client.get(channel+':messages',function(err,reply){
            if(reply){
                global.messages = JSON.parse(reply);
            }
        });
        redis_client.get(channel+':users',function(err,reply){
            if(reply){
                global.users = JSON.parse(reply);
            }
        });
    });

    socket.on('typing',function(){
        var keys = Object.keys(socket.rooms);
        socket.broadcast.to(socket.rooms[keys[1]]).emit('typing',socket.username+" is typing...");
    });

    socket.on('finished-typing',function(){
        var keys = Object.keys(socket.rooms);
        socket.broadcast.to(socket.rooms[keys[1]]).emit('typing');
    })

    socket.on('disconnect',function(){
        console.log(socket.username+" disconnected!");
        users.pop(socket.username);
        redis_client.set(channel+':users',JSON.stringify(users));
    });
    socket.on('chat message',function(data){
        person = socket.username;
        current_message  = {};
        var keys = Object.keys(socket.rooms);
        channel = socket.rooms[keys[1]];
        // console.log(socket.rooms[keys[0]]);
        current_message['user'] = person;
        current_message['message'] = data;
        new_message = [];
        new_message.push(current_message);
        messages.push(current_message);
        socket.broadcast.to(channel).emit('chat message',new_message);
        redis_client.set(channel+':messages',JSON.stringify(messages));
    });
});

http.listen(8081);