// initial variables and functions
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
var users = {};
var fs = require("fs");
var multer = require('multer');
var upload = multer({dest: './uploads/'});
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
server.listen(3000);


app.post('/img', upload.any(), function (req,res) {

    console.log('sdfsdfsdfdsf');
    res.send(req.files[0].path);
});
// app.post('/login',function(req,res){
//     var clientUsername=req.body.user;
//     var password=req.body.password;
//     var contents = fs.readFileSync("users.json");
//     var jsonContent = JSON.parse(contents);
//     var usersArray = jsonContent.employees;
//     for (var i = 0; i < usersArray.length; ++i) {
//         if (usersArray[i].username === clientUsername) {
//             if (usersArray[i].password === password) {
//                 console.log('successful username');
//                 res.redirect('http://localhost:3000/chat')
//             } else {
//                 console.log('wrong password')
//             }
//         }
//     }
//     //console.log(jsonContent.employees[0]);
//     //console.log("User name = "+clientUsername+", password is "+password);
//     res.end("yes");
//
// });



app.get('/chat', function(req, res){
    console.log('entered to CHAT');
    res.sendfile('index.html');
});
app.get('/', function(req, res){
    res.sendfile('login.html');
});
app.get('/uploads/:someFIle', function(req, res){
    res.sendfile(__dirname+req.url);
});


io.sockets.on('connection',function (socket) {

    // New user is connected
    socket.on('new user', function (data, callback) {
        if (data in users) {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            users[socket.nickname] = socket;
            updateNicknames()
        }
    });

    // Function that updates nicknames
    function updateNicknames() {
        io.sockets.emit('usernames', Object.keys(users))
    }

    // Sending a Message
    socket.on('send message',function (data, callback) {
         var msg = data.trim(); // Trims the white spaces

        // Checks if the message is private
         if (msg.substr(0,3) === '/w '){
             msg = msg.substr(3);
             var ind = msg.indexOf(' ');

             // Selects the name whom the user whispers
             if (ind !== -1) {
                 var name = msg.substring(0,ind);
                 msg = msg.substring(ind + 1);

                 // Checks if the user with that name exists
                 if (name in users) {
                     users[name].emit('whisper', {msg:msg, nick: socket.nickname});// same as socket.emit, emits for the user who must get pm
                     console.log('Whisper');
                 } else {
                     callback('Error: Enter a valid user');
                 }
             } else { // Checks if the private message exists or it is space
                callback(' Error, please enter the private message')
             }
        } else {
            io.sockets.emit('new message', {msg:msg, nick: socket.nickname});
        }
    });


    // Disconnecting a user
    socket.on('disconnect' , function (data) {
        if (!socket.nickname) {
            return;
        }
       delete users[socket.nickname];
        updateNicknames()
    });
});
