"use strict";

const socket = io();

socket.on('message', (msg) => console.log(msg));

const form = document.getElementById('send-message-form');

form.addEventListener('submit', E => {
    E.preventDefault();
    let msg = E.target.elements.message.value;

    /**
     * Event sendMsg
     * var msg
     * Event Acknowledgements
     */
    socket.emit('sendMsg', msg, (error) => {
        if (error) return console.log(error);
        console.log('Message delivered!');
    });
});

document.getElementById('share-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    /** @inheritDoc on https://developer.mozilla.org/fr/docs/Web/API/Geolocation_API */
    navigator.geolocation.getCurrentPosition((location) => {
        location = {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
        };

        socket.emit('shareLocation', location, (message) => console.log(message));
    });
});