import { Deck } from './Deck';
import { Card } from './Card';
import Player from './Player';
import Room from '../utils/Room.js';
import Pattern from "./Pattern";

const updateChip = require('../utils/updateChip.js');

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

    public static computeMaxPattern(handCards: Card[], publicCards: Card[]): Pattern {
        const allCards = handCards.concat(publicCards);
        let maxPattern = new Pattern(allCards.slice(0, 5));
        for (let i = 0; i < allCards.length - 1; i += 1) {
            for (let j = i + 1; j < allCards.length; j += 1) {
                const currCards = [];
                for (let m = 0; m < allCards.length; m += 1) {
                    if (m !== i && m !== j) {
                        currCards.push(allCards[m]);
                    }
                }
                const currPattern = new Pattern(currCards);
                if (currPattern.compare(maxPattern) === 1) {
                    maxPattern = currPattern;
                }
            }
        }
        return maxPattern;
    }

    public static winnerFormat(pattern: Pattern | null, ...winners: Player[]): string {
        if (pattern === null) {
            return `${winners[0].username} wins!`;
        }
        const patternName = pattern.name;
        if (winners.length > 1) {
            return `${winners.map(winner => winner.username).join(', ')} win by ${patternName}`;
        } else {
            return `${winners[0].username} wins by ${patternName}`;
        }
    }

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
            updateChip(player.username, award);
        });
    }

    private revealHand() {
        this.activePlayers.forEach((player) => {
            this.room.roomBroadcast('card', {
                username: player.username,
                card: player.hand[0],
            });
            this.room.roomBroadcast('card', {
                username: player.username,
                card: player.hand[1],
            });
        });
    }

    private close() {
        this.ended = true;
        this.room.roomBroadcast('inTurn', '');
        if (this.existOnlyOne()) {
            this.winMoney(this.activePlayers[0]);
            this.room.roomBroadcast('announcement', Game.winnerFormat(null, ...this.activePlayers));
        } else {
            this.revealHand();
            const winners: Player[] = [];
            let winnerPattern: Pattern = null;
            this.activePlayers.forEach((player) => {
                const currPattern = Game.computeMaxPattern(player.hand, this.publicCards);
                if (winners.length === 0) {
                    winners.push(player);
                    winnerPattern = currPattern;
                    return;
                }
                const compare = currPattern.compare(winnerPattern);
                if (compare === 0) {
                    winners.push(player);
                } else if (compare === 1) {
                    winners[0] = player;
                    winnerPattern = currPattern;
                }
            });
            this.room.roomBroadcast('announcement', Game.winnerFormat(winnerPattern, ...winners));
            this.winMoney(...winners);
        }
        setTimeout(() => {
            this.endGame();
        }, 10000);
    }

    public endGame() {
        this.room.roomBroadcast('endGame', null);
        this.deck.init();
        this.pot = 0;
        this.ended = false;
        this.checkTimes = 0;
        this.raiseTimes = 0;
        this.betNumber = 0;
        this.round = Round.Preflop;
        this.players.forEach((player) => {
            player.reset();
        });
        setTimeout(() => {
            this.room.roomBroadcast('announcement', 'Game will begin in seconds...');
        }, 5000);
        setTimeout(() => {
            this.startGame();
        }, 10000);
    }

    public setNextPlayer(): void {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.currentPlayer = this.players[this.currentPlayerIndex];
        if (this.currentPlayer.isFolded) {
            this.checkTimes += 1;
            this.setNextPlayer();
        }
    }

    public processPlayer(): void {
        if (this.checkTimes >= this.players.length
            || (this.currentPlayer.betChips === this.betNumber && this.raiseTimes === 3)) {
            this.setNextRound();
            return;
        }
        this.room.roomBroadcast('inTurn', this.currentPlayer.username);
        const options = {
            fold: true,
            call: this.betNumber !== 0,
            raise: this.raiseTimes < 3,
            check: this.currentPlayer.betChips >= this.betNumber
            && !(this.currentPlayer.isBigBlind() && this.round === Round.Preflop),
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
        updateChip(this.currentPlayer.username, -chip);
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
        this[eventName]();
        this.room.roomBroadcast('announcement', `${username}: ${eventName}`)
        if (!this.ended) {
            this.setNextPlayer();
            this.processPlayer();
        }
    }

    public fold() {
        this.checkTimes += 1;
        this.currentPlayer.isFolded = true;
        this.room.roomBroadcast('fold', this.currentPlayer.username);
        if (this.existOnlyOne()) {
            this.close();
        }
    }

    public check() {
        this.checkTimes += 1;
    }

    public raise() {
        this.raiseTimes += 1;
        this.checkTimes = 0;
        this.bet(this.betNumber + this.limitBig - this.currentPlayer.betChips);
    }

    public call() {
        this.bet(this.betNumber - this.currentPlayer.betChips);
        this.checkTimes += 1;
        const isLastCall = !this.activePlayers.some(
            player => player.betChips !== this.currentPlayer.betChips
        );
        if (this.round === Round.Preflop && this.currentPlayer.isBigBlind() && isLastCall) {
            this.setNextRound();
        } else if (this.round !== Round.Preflop && isLastCall) {
            this.setNextRound();
        }
    }
};
