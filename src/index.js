"use strict";

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io'); // Docs on https://socket.io/
const Filter = require('bad-words'); // Docs on https://github.com/web-mech/badwords#readme

const app = express();
const server = http.createServer(app); // Create a separated new server
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

let msg = "Welcome to our app ";

// On connection event
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    // Server emits to a single client connection
    socket.emit('message', msg);

    // Server emits to everybody except for the current connection
    socket.broadcast.emit('message', 'A new user has joined!');

    // Server emits to all client connections
    socket.on('sendMsg', (msg, callback) => {
        const filter = new Filter();

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed!')
        }

        io.emit('message', msg);
        callback('Delivered!');
    });

    socket.on('shareLocation', (location, callback) => {
        io.emit('locationMessage', `https://google.com/maps?q=${location.latitude},${location.longitude}`);
        callback('Location shared!');
    })

    // On disconnection
    socket.on('disconnect', () => io.emit('message', 'A user has left!'));
});

server.listen(port, () => console.log('Server is up on port ' + port));