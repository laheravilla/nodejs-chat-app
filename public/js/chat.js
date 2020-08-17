"use strict";

const socket = io();

socket.on('countUpdated', (count) => {
    console.log('The count has been updated!', count);
});

document.getElementById('js-increment').addEventListener('click', Event => {
    console.log('Clicked!');
    socket.emit('increment');
});