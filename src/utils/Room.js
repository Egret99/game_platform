module.exports = class Room {
    constructor(name, description) {
        this.name = name;
        this.description = description || '';
        this.people = 0;
    }

    get roomInfo() {
        return {
            name: this.name,
            description: this.description,
            people: this.people,
        }
    }
};
