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

        // Server emits to a single client connection
        socket.emit('message', msg.generateMessage('Admin', 'Welcome!'));

        // Server emits to everybody except for the current connection
        // socket.broadcast.emit('message', msg.generateMessage('A new user has joined!'));

        // Server emits to everybody in the current chat room
        socket.broadcast.to(user.room).emit('message', msg.generateMessage('Admin', `${user.username} has joined!`));

        //
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: usrs.getUsersInRoom(user.room)
        });

        callback();
    });

    // Server emits to all client connections
    socket.on('sendMessage', (message, callback) => {
        const user = usrs.getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        // io.emit('message', msg.generateMessage(message));
        io.to(user.room || '').emit('message', msg.generateMessage(user.username, message));
        callback();
    });

    socket.on('shareLocation', (location, callback) => {
        const user = usrs.getUser(socket.id);
        io.to(user.room).emit(
            'locationMessage',
            msg.generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`)
        );
        callback();
    })

    // On disconnection
    socket.on('disconnect', () => {
        const user = usrs.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', msg.generateMessage('Admin', `${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: usrs.getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(port, () => console.log('Server is up on port ' + port));