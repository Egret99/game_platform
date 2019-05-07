const Game = require('../game/index.js');

module.exports = class Room {
    constructor(io, name, description) {
        this.io = io;
        this.name = name;
        this.description = description || '';
        this.sockets = {};
        this.players = {};
        this.game = null;
    }

    start() {
        this.game = new Game(this, this.playerList);
    }

    isFull() {
        return this.peopleNumber === 3;
    }

    removePlayer(socket) {
        Object.keys(this.sockets).forEach((username) => {
            if (this.sockets[username] === socket) {
                delete this.sockets[username];
                delete this.players[username];
            }
            if (this.game) {
                this.game.disconnect(username);
            }
        })
    }

    roomBroadcast(event, payload) {
        this.io.to(this.name).emit(event, payload);
    }

    playerEmit(username, event, payload) {
        this.sockets[username].emit(event, payload);
    }

    addPlayer(user, socket) {
        this.sockets[user.username] = socket;
        this.players[user.username] = {
            username: user.username,
            chip: user.chip,
        };
        socket.join(this.name);
        socket.on('fold', () => {
            this.game.triggerEvent(user.username, 'fold');
        });
        socket.on('check', () => {
            this.game.triggerEvent(user.username, 'check');
        });
        socket.on('raise', () => {
            this.game.triggerEvent(user.username, 'raise');
        });
        socket.on('call', () => {
            this.game.triggerEvent(user.username, 'call');
        });
        this.roomBroadcast('join', this.players[user.username]);
        if (this.isFull()) {
            this.game = new Game(this, this.playerList);
            setTimeout(() => {
                this.roomBroadcast('announcement', 'Game will begin in seconds...');
            }, 3000);
            setTimeout(() => {
                this.game.startGame();
            }, 8000);
        }
    }

    get peopleNumber() {
        return Object.keys(this.sockets).length;
    }

    get playerList() {
        return Object.keys(this.players).map(key => this.players[key]);
    }

    get roomInfo() {
        return {
            name: this.name,
            description: this.description,
            people: this.peopleNumber,
        }
    }

    get roomInfoDetail() {
        return {
            name: this.name,
            description: this.description,
            players: Object.keys(this.sockets).map(key => this.players[key]),
        }
    }
};
