"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Suit;
(function (Suit) {
    Suit[Suit["Spade"] = 0] = "Spade";
    Suit[Suit["Heart"] = 1] = "Heart";
    Suit[Suit["Club"] = 2] = "Club";
    Suit[Suit["Diamond"] = 3] = "Diamond";
})(Suit = exports.Suit || (exports.Suit = {}));
class Card {
    constructor(suit, point) {
        this.suit = suit;
        this.point = point;
    }
    compare(other) {
        if (this.point > other.point) {
            return 1;
        }
        if (this.point < other.point) {
            return -1;
        }
        return 0;
    }
}
exports.Card = Card;
;
//# sourceMappingURL=Card.js.map