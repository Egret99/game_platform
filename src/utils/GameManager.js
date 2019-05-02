const Room = require('./Room');

class GameManager {
    constructor() {
        this.rooms = [];
    }

    isFull() {
        const MAX_ROOM_NUMBER = 3;
        return this.rooms.length === MAX_ROOM_NUMBER;
    }

    hasRoom(roomName) {
        return this.rooms.some(room => room.name === roomName);
    }

    createRoom(roomName, description) {
        if (this.isFull()) {
            return;
        }
        this.rooms.push(new Room(roomName, description));
    }
}

module.exports = new GameManager();
