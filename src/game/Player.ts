import { Card } from './Card';

enum Role {
    BigBlind,
    SmallBlind,
    Dealer,
    Player,
}

export default class Player {
    public username: string;

    public chip: number;

    public betChips = 0;

    public role: Role = Role.Player;

    public hand: Card[] = [];

    public constructor(username: string, chip: number) {
        this.username = username;
        this.chip = chip;
    }

    public bet(chip: number): void {
        this.chip -= chip;
        this.betChips += chip;
    }

    public receiveCard(card: Card): void {
        this.hand.push(card);
    }

    public setBigBlind(): void {
        this.role = Role.BigBlind;
    }

    public setSmallBlind(): void {
        this.role = Role.SmallBlind;
    }

    public setDealer(): void {
        this.role = Role.Dealer;
    }

    public get isAllin(): boolean {
        return this.chip === 0;
    }
}