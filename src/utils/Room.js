module.exports = class Room {
    constructor(io, name, description) {
        this.io = io;
        this.name = name;
        this.description = description || '';
        this.sockets = {};
        this.players = {};
    }

    isFull() {
        return this.peopleNumber === 3;
    }

    addPlayer(user, socket) {
        this.sockets[user.username] = socket;
        this.players[user.username] = {
            username: user.username,
            chip: user.chip,
        };
        socket.join(this.name);
        this.io.to(this.name).emit('join', this.players[user.username]);
    }

    get peopleNumber() {
        return Object.keys(this.sockets).length;
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
