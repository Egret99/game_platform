import { Suit, Card } from './Card';
import Pattern from './Pattern';

export class Deck {
    public cards: Card[];

    public constructor() {
        this.init();
    }

    public init(): void {
        this.cards = [];
        for (let i = 2; i <= 14; i += 1) {
            this.cards.push(
                new Card(Suit.Spade, i),
                new Card(Suit.Heart, i),
                new Card(Suit.Club, i),
                new Card(Suit.Diamond, i),
            );
        }
    }

    public draw(): Card {
        const index = Math.floor(Math.random() * this.cards.length);
        return this.cards.splice(index, 1)[0];
    }
}
