"use strict";

const socket = io();

// Elements
const messageForm = document.getElementById('send-message-form');
const messageFormTextarea = messageForm.elements.message;
const messageFormBtn = messageForm.elements.btnSend;
const messagesOutput = document.getElementById('messages-output');

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

// Options
// console.log(new URL(window.location.href).searchParams.get('username'))
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }); // Get params from URL

const autoscroll = () => {
    // New message element
    const newMessage = messagesOutput.lastElementChild;

    // Get height of the new message
    const newMessagesStyle = getComputedStyle(newMessage); // Return style of an element
    const newMessageMargin = parseInt(newMessagesStyle.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = messagesOutput.offsetWidth;

    // Height of messages container
    const containerHeight = messagesOutput.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = messagesOutput.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messagesOutput.scrollTop = messagesOutput.scrollHeight;
    }
};

const resetMessage = () => {
    messageFormTextarea.value = '';
    messageFormBtn.setAttribute('disabled', 'disabled'); // Disable button once submitted
};

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:ss a')
    });
    messagesOutput.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm:ss a')
    });
    messagesOutput.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

resetMessage();

socket.on('roomData', ({ room, users }) => {
    document.getElementById('sidebar').innerHTML = Mustache.render(sidebarTemplate, {room, users});
});

messageFormTextarea.addEventListener('keyup', e => {
    if (e.currentTarget.value !== '') {
        messageFormBtn.removeAttribute('disabled'); // Enable button
    } else {
        resetMessage();
    }
});

messageForm.addEventListener('submit', e => {
    e.preventDefault();

    let message = e.target.elements.message.value;

    /**
     * Event sendMsg
     * var msg
     * Event Acknowledgements
     */
    socket.emit('sendMessage', message, (error) => {
        resetMessage()
        messageFormTextarea.focus();

        if (error) return console.log(error);
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
        });
    });
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'; // Redirect to login
    }
});