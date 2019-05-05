module.exports = class Room {
    constructor(name, description) {
        this.name = name;
        this.description = description || '';
        this.people = {};
    }

    isFull() {
        return this.peopleNumber === 3;
    }

    addPlayer(username, socket) {
        this.people[username] = socket;
    }

    get peopleNumber() {
        return Object.keys(this.people).length;
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
            players: Object.keys(this.people),
        }
    }
};
