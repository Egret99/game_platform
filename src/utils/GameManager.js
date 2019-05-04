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
        const newRoom = new Room(roomName, description);
        this.rooms.push(newRoom);
        return newRoom;
    }

    getRoomByName(roomName) {
        return this.rooms.filter(room => room.name === roomName)[0];
    }

    get allRoomsInfo() {
        return this.rooms.map(room => room.roomInfo);
    }
}

module.exports = new GameManager();
