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
        const newRoom = new Room(roomName, description)
        this.rooms.push(newRoom);
        return newRoom;
    }

    getRoomByName(roomName) {
        const room = rooms.filter(room => room.name === roomName)[0];
        return room;
    }

    getAllRooms() {
        return this.rooms;
    }
}

module.exports = new GameManager();
