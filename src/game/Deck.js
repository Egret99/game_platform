"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Card_1 = require("./Card");
class Deck {
    constructor() {
        this.init();
    }
    init() {
        this.cards = [];
        for (let i = 2; i <= 14; i += 1) {
            this.cards.push(new Card_1.Card(Card_1.Suit.Spade, i), new Card_1.Card(Card_1.Suit.Heart, i), new Card_1.Card(Card_1.Suit.Club, i), new Card_1.Card(Card_1.Suit.Diamond, i));
        }
    }
    draw() {
        const index = Math.floor(Math.random() * this.cards.length);
        return this.cards.splice(index, 1)[0];
    }
}
exports.Deck = Deck;
//# sourceMappingURL=Deck.js.map