const Room = require('./Room');

class GameManager {
    constructor() {
        this.io = null;
        this.rooms = [];
        this.waitList = [];
        this.authorizedList = {};
    }

    setIO(io) {
        this.io = io;
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
        const newRoom = new Room(this.io, roomName, description);
        this.rooms.push(newRoom);
        return newRoom;
    }

    addWaitingClient(socket) {
        this.waitList.push(socket);
    }

    authorizeSocket(socketId, user, roomName) {
        if (!this.hasRoom(roomName) || this.getRoomByName(roomName).isFull()) {
            return undefined;
        }
        for (let i = 0; i < this.waitList.length; i += 1) {
            const curr = this.waitList[i];
            if (curr.id === socketId) {
                this.authorizedList[user.username] = curr;
                this.waitList.splice(i, 1);
                this.getRoomByName(roomName).addPlayer(user, curr);
                return curr;
            }
        }
        return undefined;
    }

    getRoomByName(roomName) {
        return this.rooms.filter(room => room.name === roomName)[0];
    }

    get allRoomsInfo() {
        return this.rooms.map(room => room.roomInfo);
    }
}

module.exports = new GameManager();
