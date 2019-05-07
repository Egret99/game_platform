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

    public publicCards: Card[] = [];

    public pot = 0;

    public ended = false;

    public limitSmall = 1;

    public limitBig = this.limitSmall * 2;

    public currentPlayer: Player = null;

    public currentPlayerIndex = -1;

    public lastDealerIndex = -1;

    public checkTimes = 0;

    public raiseTimes = 0;

    public betNumber = 0;

    public round = Round.Preflop;

    public constructor(room: Room, players: { username: string, chip: number }[]) {
        this.room = room;
        this.players = players.map(player => new Player(player.username, player.chip));
    }

    private get activePlayers(): Player[] {
        return this.players.filter(player => !player.isFolded);
    }

    public startGame(): void {
        const firstPlayerIndex = this.lastDealerIndex === -1
            ? 0 : (this.lastDealerIndex + 1) % this.players.length;
        this.lastDealerIndex = firstPlayerIndex;
        this.currentPlayerIndex = firstPlayerIndex;
        this.currentPlayer = this.players[firstPlayerIndex];
        this.players.forEach((player) => {
            this.initDeal(player);
        });
        this.currentPlayer.setDealer();
        this.setNextPlayer();
        this.currentPlayer.setSmallBlind();
        this.bet(this.limitSmall);
        this.setNextPlayer();
        this.currentPlayer.setBigBlind();
        this.bet(this.limitBig);
        this.setNextPlayer();
        this.processPlayer();
    }

    private setStartingPlayer(): void {
        for (let i = 0; i < this.players.length; i += 1) {
            if (this.players[i].isDealer()) {
                this.currentPlayerIndex = i;
                this.currentPlayer = this.players[i];
            }
        }
        if (this.currentPlayer.isFolded) {
            this.setNextPlayer();
        }
    }

    private existOnlyOne(): boolean {
        return this.players.filter(player => !player.isFolded).length === 1;
    }

    private winMoney(...winners: Player[]): void {
        const award = Math.floor(this.pot / winners.length);
        winners.forEach((player) => {
            this.room.roomBroadcast('addMoney', {
                username: player.username,
                chip: award,
            });
        });
    }

    private close() {
        this.ended = true;
        if (this.existOnlyOne()) {
            this.winMoney(this.activePlayers[0]);
        }
    }

    public setNextPlayer(): void {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.currentPlayer = this.players[this.currentPlayerIndex];
        if (this.currentPlayer.isFolded) {
            this.setNextPlayer();
        }
    }

    public processPlayer(): void {
        if (this.currentPlayer.betChips === this.betNumber && this.raiseTimes === 3) {
            this.setNextRound();
        }
        const options = {
            fold: true,
            call: this.betNumber !== 0,
            raise: this.raiseTimes < 3,
            check: this.currentPlayer.betChips >= this.betNumber,
        };
        this.room.playerEmit(this.currentPlayer.username, 'myTurn', options);
    }

    public setNextRound(): void {
        if (this.round === Round.River) {
            this.close();
            return;
        }
        if (this.round === Round.Preflop) {
            this.addPublicCard();
            this.addPublicCard();
        }
        this.round += 1;
        this.addPublicCard();
        this.betNumber = 0;
        this.raiseTimes = 0;
        this.checkTimes = 0;
        this.activePlayers.forEach((player) => {
            player.betChips = 0;
        });
        this.setStartingPlayer();
        this.processPlayer();
        this.room.roomBroadcast('newRound', null);
    }

    public bet(chip: number): void {
        this.currentPlayer.bet(chip);
        if (this.currentPlayer.betChips > this.betNumber) {
            this.betNumber = this.currentPlayer.betChips;
        }
        this.room.roomBroadcast('bet', {
            username: this.currentPlayer.username,
            chip,
        });
        this.pot += chip;
    }

    private deal(player: Player, card: Card): void {
        player.receiveCard(card);
        this.room.playerEmit(player.username,'card', {
            username: player.username,
            card,
        });
    }

    public initDeal(player: Player): void {
        this.deal(player, this.deck.draw());
        this.deal(player, this.deck.draw());
    }

    public addPublicCard(): void {
        const card = this.deck.draw();
        this.publicCards.push(card);
        this.room.roomBroadcast('publicCard', card);
    }

    public triggerEvent(username: string, eventName: string): void {
        if (username !== this.currentPlayer.username) {
            return;
        }
        this.room.playerEmit(username, 'endTurn', null);
        this[eventName]();
        if (!this.ended) {
            this.setNextPlayer();
            this.processPlayer();
        }
    }

    public fold() {
        this.currentPlayer.isFolded = true;
        if (this.existOnlyOne()) {
            this.close();
        }
    }

    public check() {
        this.checkTimes += 1;
        if (this.checkTimes >= this.activePlayers.length) {
            this.setNextRound();
        }
    }

    public raise() {
        this.raiseTimes += 1;
        this.bet(this.betNumber + this.limitBig - this.currentPlayer.betChips);
    }

    public call() {
        this.bet(this.betNumber - this.currentPlayer.betChips);
        if (!this.activePlayers.some(
            player => player.betChips !== this.currentPlayer.betChips
        )) {
            this.setNextRound();
        }
        // TODO: allow big blind to raise
    }
};
