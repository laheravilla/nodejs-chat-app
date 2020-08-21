"use strict";

module.exports = {
    addUser({ id, username, room }) {
        // Clean data
        username = username.trim().toLowerCase();
        room = room.trim().toLowerCase();

        // Validate data
        if (!username || !room) return { error: "Username and room are required!" };

        // Check for existing user
        const userExists = this.users.find(user => user.room === room && user.username === username);

        // Validate username
        if (userExists) return { error: "Username is in use!" };

        // Store user
        const user = { id, username, room };
        this.users.push(user);

        return { user };
    },
    removeUser(id) {
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) return this.users.splice(index, 1)[0]
    },
    getUser(id) {
        return this.users.find(user => user.id === id);
    },
    getUsersInRoom(room) {
        return this.users.filter(user => user.room === room);
    },
    users: []
};