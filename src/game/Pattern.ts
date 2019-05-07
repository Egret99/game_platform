import { CompareResult, Card } from './Card';
import { Deck } from "./Deck";

enum HandValue {
    HighCard,
    Pair,
    TwoPairs,
    ThreeOfAKind,
    Straight,
    Flush,
    FullHouse,
    FourOfAKind,
    StraightFlush,
    RoyalFlush,
}

interface PatternStructure {
    [point: number]: number;
}

export default class Pattern {
    public cards: Card[];

    public value: HandValue;

    public subValue = 0;

    public constructor(cards: Card[]) {
        this.cards = cards;
        this.sortCard();
        this.estimateValue();
    }

    public static sortFunc(card1: Card, card2: Card): CompareResult {
        return card1.compare(card2);
    }

    public get name(): string {
        return HandValue[this.value];
    }

    private sortCard(): void {
        this.cards.sort(Pattern.sortFunc);
        this.cards.reverse();
    }

    private valueCompare(other: Pattern): CompareResult {
        if (this.value > other.value) {
            return 1;
        }
        if (this.value < other.value) {
            return -1;
        }
        return 0;
    }

    private subValueCompare(other: Pattern): CompareResult {
        if (this.subValue > other.subValue) {
            return 1;
        }
        if (this.subValue < other.subValue) {
            return -1;
        }
        return 0;
    }

    private regularCompare(other: Pattern): CompareResult {
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

    public compare(other: Pattern): CompareResult {
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

    private isStraight(): boolean {
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

    private isFlush(): boolean {
        for (let i = 0; i < 4; i += 1) {
            const curr = this.cards[i];
            const next = this.cards[i + 1];
            if (next.suit !== curr.suit) {
                return false;
            }
        }
        return true;
    }

    private getStructure(): PatternStructure {
        const structure = Object.create(null);
        this.cards.forEach((card) => {
            const count = structure[card.point] || 0;
            structure[card.point] = count + 1;
        });
        return structure;
    }

    private royalFlush(): void {
        this.value = HandValue.RoyalFlush;
    }

    private straightFlush(): void {
        this.value = HandValue.StraightFlush;
        this.subValue = this.cards[0].point === 14 ? 1 : this.cards[0].point;
    }

    private flush(): void {
        this.value = HandValue.Flush;
        this.subValue = this.cards[0].point;
    }

    private straight() {
        this.value = HandValue.Straight;
        if (this.cards[0].point === 14 && this.cards[1].point === 5) {
            this.subValue = 1;
        } else {
            this.subValue = this.cards[0].point;
        }
    }

    private fourOfAKind(structure: PatternStructure) {
        this.value = HandValue.FourOfAKind;
        Object.keys(structure).forEach((point) => {
            if (structure[point] === 4) {
                this.subValue = parseInt(point, 10);
            }
        });
    }

    private fullHouse(structure: PatternStructure) {
        this.value = HandValue.FullHouse;
        Object.keys(structure).forEach((point) => {
            if (structure[point] === 3) {
                this.subValue = parseInt(point, 10);
            }
        });
    }

    private threeOfAKind(structure: PatternStructure) {
        this.value = HandValue.ThreeOfAKind;
        Object.keys(structure).forEach((point) => {
            if (structure[point] === 3) {
                this.subValue = parseInt(point, 10);
            }
        });
    }

    private twoPairs(structure: PatternStructure) {
        this.value = HandValue.TwoPairs;
        let largePoint = 0;
        let smallPoint = 0;
        Object.keys(structure).forEach((point) => {
            if (structure[point] === 2) {
                const pointValue = parseInt(point, 10);
                if (pointValue > largePoint) {
                    smallPoint = largePoint;
                    largePoint = pointValue;
                } else {
                    smallPoint = pointValue;
                }
            }
        });
        this.subValue = largePoint * 100 + smallPoint;
    }

    private pair(structure: PatternStructure) {
        this.value = HandValue.Pair;
        Object.keys(structure).forEach((point) => {
            if (structure[point] === 2) {
                this.subValue = parseInt(point, 10);
            }
        })
    }

    private highCard() {
        this.value = HandValue.HighCard;
    }

    public estimateValue(): void {
        const isFlush = this.isFlush();
        const isStraight = this.isStraight();
        if (isFlush && isStraight) {
            if (this.cards[1].point === 13) {
                this.royalFlush();
            } else {
                this.straightFlush();
            }
        } else if (isFlush) {
            this.flush();
        } else if (isStraight) {
            this.straight();
        } else {
            const structure = this.getStructure();
            const countStructure = Object.keys(structure).map(key => structure[key]);
            if (countStructure.length === 2) {
                countStructure.some(value => value === 4)
                ? this.fourOfAKind(structure) : this.fullHouse(structure);
            } else if (countStructure.length === 3) {
                countStructure.some(value => value === 3)
                ? this.threeOfAKind(structure) : this.twoPairs(structure);
            } else if (countStructure.length === 4) {
                this.pair(structure);
            } else {
                this.highCard();
            }
        }
    }
}
