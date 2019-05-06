import { Deck } from './Deck';
import { Card } from './Card';
import Player from './Player';
import Room from '../utils/Room.js';

enum Round {
    Preflop,
    Flop,
    Turn,
    River,
}

module.exports = class Game {
    public room;

    public deck = new Deck();

    public players: Player[];

    public activePlayers: Player[] = [];

    public publicCards: Card[] = [];

    public pot = 0;

    public limit = 1;

    public currentPlayer: Player = null;

    public currentPlayerIndex = -1;

    public lastDealerIndex = -1;

    public raiseTimes = 0;

    public betNumber = 0;

    public round = Round.Preflop;

    public constructor(room: Room, players: { username: string, chip: number }[]) {
        this.room = room;
        this.players = players.map(player => new Player(player.username, player.chip));
    }

    public startGame(): void {
        this.activePlayers = this.players.concat();
        const firstPlayerIndex = this.lastDealerIndex === -1
            ? 0 : (this.lastDealerIndex + 1) % this.players.length;
        this.lastDealerIndex = firstPlayerIndex;
        this.currentPlayerIndex = firstPlayerIndex;
        this.currentPlayer = this.activePlayers[firstPlayerIndex];
        this.setNextPlayer();
        this.currentPlayer.setSmallBlind();
        this.setNextPlayer();
        this.currentPlayer.setBigBlind();
        this.setNextPlayer();
    }

    public setNextPlayer(): void {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.activePlayers.length;
        this.currentPlayer = this.activePlayers[this.currentPlayerIndex];
    }

    public setNextRound(): void {
        this.round += 1;
    }

    public bet(chip: number): void {
        this.currentPlayer.bet(chip);
        this.pot += chip;
    }

    private deal(player: Player, card: Card): void {
        player.receiveCard(card);
    }

    public initDeal(player: Player) {
        this.deal(player, this.deck.draw());
        this.deal(player, this.deck.draw());
    }

    public addPublicCard() {
        this.publicCards.push(this.deck.draw());
    }
}
