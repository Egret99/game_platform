"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Role;
(function (Role) {
    Role[Role["BigBlind"] = 0] = "BigBlind";
    Role[Role["SmallBlind"] = 1] = "SmallBlind";
    Role[Role["Dealer"] = 2] = "Dealer";
    Role[Role["Player"] = 3] = "Player";
})(Role || (Role = {}));
class Player {
    constructor(username, chip) {
        this.betChips = 0;
        this.isFolded = false;
        this.isOffline = false;
        this.role = Role.Player;
        this.hand = [];
        this.username = username;
        this.chip = chip;
    }
    bet(chip) {
        this.chip -= chip;
        this.betChips += chip;
    }
    receiveCard(card) {
        this.hand.push(card);
    }
    setBigBlind() {
        this.role = Role.BigBlind;
    }
    setSmallBlind() {
        this.role = Role.SmallBlind;
    }
    setDealer() {
        this.role = Role.Dealer;
    }
    isDealer() {
        return this.role === Role.Dealer;
    }
    isBigBlind() {
        return this.role === Role.BigBlind;
    }
    get isAllin() {
        return this.chip === 0;
    }
    reset() {
        this.betChips = 0;
        this.isFolded = false;
        this.role = Role.Player;
        this.hand = [];
    }
}
exports.default = Player;
//# sourceMappingURL=Player.js.map