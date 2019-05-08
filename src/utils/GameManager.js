const Room = require('./Room');

class GameManager {
    constructor() {
        this.io = null;
        this.rooms = [];
        this.waitList = [];
        this.authorizedList = {};
        setInterval(() => {
            this.destroyRoom();
        }, 60 * 1000);
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

    destroyRoom() {
        for (let i = this.rooms.length - 1; i >= 0; i -= 1) {
            const curr = this.rooms[i];
            if (curr.peopleNumber === 0 && curr.isOld()) {
                this.rooms.splice(i, 1);
            }
        }
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

    disconnectSocket(socket) {
        for (let i = 0; i < this.waitList.length; i += 1) {
            if (this.waitList[i] === socket) {
                this.waitList.splice(i, 1);
                return;
            }
        }
        Object.keys(this.authorizedList).forEach(key => {
            if (this.authorizedList[key] === socket) {
                delete this.authorizedList[key];
            }
        });
        this.rooms.forEach((room) => {
            room.removePlayer(socket);
        });
    }

    get allRoomsInfo() {
        return this.rooms.map(room => room.roomInfo);
    }
}

module.exports = new GameManager();
