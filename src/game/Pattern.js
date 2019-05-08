"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Deck_1 = require("./Deck");
var HandValue;
(function (HandValue) {
    HandValue[HandValue["HighCard"] = 0] = "HighCard";
    HandValue[HandValue["Pair"] = 1] = "Pair";
    HandValue[HandValue["TwoPairs"] = 2] = "TwoPairs";
    HandValue[HandValue["ThreeOfAKind"] = 3] = "ThreeOfAKind";
    HandValue[HandValue["Straight"] = 4] = "Straight";
    HandValue[HandValue["Flush"] = 5] = "Flush";
    HandValue[HandValue["FullHouse"] = 6] = "FullHouse";
    HandValue[HandValue["FourOfAKind"] = 7] = "FourOfAKind";
    HandValue[HandValue["StraightFlush"] = 8] = "StraightFlush";
    HandValue[HandValue["RoyalFlush"] = 9] = "RoyalFlush";
})(HandValue || (HandValue = {}));
class Pattern {
    constructor(cards) {
        this.subValue = 0;
        this.cards = cards;
        this.sortCard();
        this.estimateValue();
    }
    static sortFunc(card1, card2) {
        return card1.compare(card2);
    }
    get name() {
        return HandValue[this.value];
    }
    sortCard() {
        this.cards.sort(Pattern.sortFunc);
        this.cards.reverse();
    }
    valueCompare(other) {
        if (this.value > other.value) {
            return 1;
        }
        if (this.value < other.value) {
            return -1;
        }
        return 0;
    }
    subValueCompare(other) {
        if (this.subValue > other.subValue) {
            return 1;
        }
        if (this.subValue < other.subValue) {
            return -1;
        }
        return 0;
    }
    regularCompare(other) {
        for (let i = 0; i < 5; i += 1) {
            const curr = this.cards[i];
            const otherCurr = other.cards[i];
            const currResult = curr.compare(otherCurr);
            if (currResult !== 0) {
                return currResult;
            }
        }
        return 0;
    }
    compare(other) {
        const firstRound = this.valueCompare(other);
        if (firstRound !== 0) {
            return firstRound;
        }
        const secondRound = this.subValueCompare(other);
        if (secondRound !== 0) {
            return secondRound;
        }
        return this.regularCompare(other);
    }
    isStraight() {
        for (let i = 0; i < 4; i += 1) {
            const curr = this.cards[i];
            const next = this.cards[i + 1];
            const pointDiff = curr.point - next.point;
            const isAceAndFive = curr.point === 14 && next.point === 5;
            if (pointDiff !== 1 && !isAceAndFive) { // [A, 5, 4, 3, 2] is also straight
                return false;
            }
        }
        return true;
    }
    isFlush() {
        for (let i = 0; i < 4; i += 1) {
            const curr = this.cards[i];
            const next = this.cards[i + 1];
            if (next.suit !== curr.suit) {
                return false;
            }
        }
        return true;
    }
    getStructure() {
        const structure = Object.create(null);
        this.cards.forEach((card) => {
            const count = structure[card.point] || 0;
            structure[card.point] = count + 1;
        });
        return structure;
    }
    royalFlush() {
        this.value = HandValue.RoyalFlush;
    }
    straightFlush() {
        this.value = HandValue.StraightFlush;
        this.subValue = this.cards[0].point === 14 ? 1 : this.cards[0].point;
    }
    flush() {
        this.value = HandValue.Flush;
        this.subValue = this.cards[0].point;
    }
    straight() {
        this.value = HandValue.Straight;
        if (this.cards[0].point === 14 && this.cards[1].point === 5) {
            this.subValue = 1;
        }
        else {
            this.subValue = this.cards[0].point;
        }
    }
    fourOfAKind(structure) {
        this.value = HandValue.FourOfAKind;
        Object.keys(structure).forEach((point) => {
            if (structure[point] === 4) {
                this.subValue = parseInt(point, 10);
            }
        });
    }
    fullHouse(structure) {
        this.value = HandValue.FullHouse;
        Object.keys(structure).forEach((point) => {
            if (structure[point] === 3) {
                this.subValue = parseInt(point, 10);
            }
        });
    }
    threeOfAKind(structure) {
        this.value = HandValue.ThreeOfAKind;
        Object.keys(structure).forEach((point) => {
            if (structure[point] === 3) {
                this.subValue = parseInt(point, 10);
            }
        });
    }
    twoPairs(structure) {
        this.value = HandValue.TwoPairs;
        let largePoint = 0;
        let smallPoint = 0;
        Object.keys(structure).forEach((point) => {
            if (structure[point] === 2) {
                const pointValue = parseInt(point, 10);
                if (pointValue > largePoint) {
                    smallPoint = largePoint;
                    largePoint = pointValue;
                }
                else {
                    smallPoint = pointValue;
                }
            }
        });
        this.subValue = largePoint * 100 + smallPoint;
    }
    pair(structure) {
        this.value = HandValue.Pair;
        Object.keys(structure).forEach((point) => {
            if (structure[point] === 2) {
                this.subValue = parseInt(point, 10);
            }
        });
    }
    highCard() {
        this.value = HandValue.HighCard;
    }
    estimateValue() {
        const isFlush = this.isFlush();
        const isStraight = this.isStraight();
        if (isFlush && isStraight) {
            if (this.cards[1].point === 13) {
                this.royalFlush();
            }
            else {
                this.straightFlush();
            }
        }
        else if (isFlush) {
            this.flush();
        }
        else if (isStraight) {
            this.straight();
        }
        else {
            const structure = this.getStructure();
            const countStructure = Object.keys(structure).map(key => structure[key]);
            if (countStructure.length === 2) {
                countStructure.some(value => value === 4)
                    ? this.fourOfAKind(structure) : this.fullHouse(structure);
            }
            else if (countStructure.length === 3) {
                countStructure.some(value => value === 3)
                    ? this.threeOfAKind(structure) : this.twoPairs(structure);
            }
            else if (countStructure.length === 4) {
                this.pair(structure);
            }
            else {
                this.highCard();
            }
        }
    }
}
exports.default = Pattern;
const deck = new Deck_1.Deck();
const publicCards = [
    deck.draw(),
    deck.draw(),
    deck.draw(),
    deck.draw(),
    deck.draw(),
];
const handCards = [
    deck.draw(),
    deck.draw(),
];
//# sourceMappingURL=Pattern.js.map