const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io'); // Docs on https://socket.io/

const app = express();
const server = http.createServer(app); // Create a separated new server
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

let count = 0;

io.on('connection', (socket) => {
    console.log('New WebSocket connection');
    socket.emit('countUpdated', count);
    socket.on('increment', () => {
        // socket.emit('countUpdated', count++); // Emits to a specific connection
        io.emit('countUpdated', count++); // Emits to all connections
    });
});

server.listen(port, () => console.log('Server is up on port ' + port));