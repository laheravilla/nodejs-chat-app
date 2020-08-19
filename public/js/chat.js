"use strict";

const socket = io();

// Elements
const messageForm = document.getElementById('send-message-form');
const messageFormTextarea = messageForm.elements.message;
const messageFormBtn = messageForm.elements.btnSend;

const resetMessage = () => {
    messageFormTextarea.value = '';
    messageFormBtn.setAttribute('disabled', 'disabled'); // Disable button once submitted
};

socket.on('message', (msg) => console.log(msg));

resetMessage();

messageFormTextarea.addEventListener('keyup', e => {
    console.log(e.currentTarget.value)
    if (e.currentTarget.value !== '') {
        messageFormBtn.removeAttribute('disabled'); // Enable button
    } else {
        resetMessage();
    }
});

messageForm.addEventListener('submit', e => {
    e.preventDefault();

    let msg = e.target.elements.message.value;

    /**
     * Event sendMsg
     * var msg
     * Event Acknowledgements
     */
    socket.emit('sendMsg', msg, (error) => {
        resetMessage()
        messageFormTextarea.focus();

        if (error) return console.log(error);
        console.log('Message delivered!');
    });
});

document.getElementById('share-location').addEventListener('click', (e) => {
    const shareLocationBtn = e.currentTarget;
    shareLocationBtn.setAttribute('disabled', 'disabled');

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    /** @inheritDoc on https://developer.mozilla.org/fr/docs/Web/API/Geolocation_API */
    navigator.geolocation.getCurrentPosition((location) => {
        location = {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
        };

        socket.emit('shareLocation', location, (message) => {
            shareLocationBtn.removeAttribute('disabled'); // Enable button

            console.log(message);
        });
    });
});