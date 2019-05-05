export type CompareResult = -1 | 0 | 1;

export enum Suit {
    Spade = '♠️',
    Heart = '♥️',
    Club = '♣️',
    Diamond = '♦️',
}

export class Card {
    public suit: Suit;

    public point: number;

    public constructor(suit: Suit, point: number) {
        this.suit = suit;
        this.point = point;
    }

    public compare(other: Card): CompareResult {
        if (this.point > other.point) {
            return 1;
        }
        if (this.point < other.point) {
            return -1;
        }
        return 0;
    }
};
