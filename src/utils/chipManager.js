class ChipManager {
    constructor() {
        this.chips = Object.create(null);
    }

    sync(user) {
        if (user === undefined) {
            return;
        }
        const { username, chip } = user;
        if (this.chips[username] === undefined) {
            this.chips[username] = chip;
        } else if (this.chips[username] !== chip) {
            user.chip = this.chips[username];
        }
    }

    update(user) {
        const { username, chip } = user;
        this.chips[username] = chip;
    }
}

module.exports = new ChipManager();
