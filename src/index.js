"use strict";

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io'); // Docs on https://socket.io/
const Filter = require('bad-words'); // Docs on https://github.com/web-mech/badwords#readme
const msg = require('./utils/messages');
const usrs = require('./utils/users');

const app = express();
const server = http.createServer(app); // Create a separated new server
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

// On connection event
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('join', (options, callback) => {
        const { error, user } = usrs.addUser({ id: socket.id, ...options }); // Id is provided by socket
        if (error) return callback(error);

        socket.join(user.room); // Join a room chat
        console.log('room: ', user.room)

        // Server emits to a single client connection
        socket.emit('message', msg.generateMessage('Welcome!'));

        // Server emits to everybody except for the current connection
        // socket.broadcast.emit('message', msg.generateMessage('A new user has joined!'));

        // Server emits to everybody in the current chat room
        socket.broadcast.to(user.room).emit('message', msg.generateMessage(`${user.username} has joined!`));

        callback();
    });

    // Server emits to all client connections
    socket.on('sendMessage', (message, callback) => {
        console.log('server -> ', message)
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        // io.emit('message', msg.generateMessage(message));
        io.to('france').emit('message', msg.generateMessage(message));
        callback();
    });

    socket.on('shareLocation', (location, callback) => {
        io.emit(
            'locationMessage',
            msg.generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`)
        );
        callback('Location shared!');
    })

    // On disconnection
    socket.on('disconnect', () => {
        const user = usrs.removeUser(socket.id);
        if (user) io.to(user.room).emit('message', msg.generateMessage(`${user.username} has left!`))
    });
});

server.listen(port, () => console.log('Server is up on port ' + port));