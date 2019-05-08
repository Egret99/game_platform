"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Deck_1 = require("./Deck");
const Player_1 = require("./Player");
const Pattern_1 = require("./Pattern");
const updateChip = require('../utils/updateChip.js');
var Round;
(function (Round) {
    Round[Round["Preflop"] = 0] = "Preflop";
    Round[Round["Flop"] = 1] = "Flop";
    Round[Round["Turn"] = 2] = "Turn";
    Round[Round["River"] = 3] = "River";
})(Round || (Round = {}));
module.exports = class Game {
    constructor(room) {
        this.deck = new Deck_1.Deck();
        this.players = [];
        this.publicCards = [];
        this.pot = 0;
        this.started = false;
        this.limitSmall = 1;
        this.limitBig = this.limitSmall * 2;
        this.currentPlayer = null;
        this.currentPlayerIndex = -1;
        this.lastDealerIndex = -1;
        this.checkTimes = 0;
        this.raiseTimes = 0;
        this.betNumber = 0;
        this.round = Round.Preflop;
        this.room = room;
    }
    static computeMaxPattern(handCards, publicCards) {
        const allCards = handCards.concat(publicCards);
        let maxPattern = new Pattern_1.default(allCards.slice(0, 5));
        for (let i = 0; i < allCards.length - 1; i += 1) {
            for (let j = i + 1; j < allCards.length; j += 1) {
                const currCards = [];
                for (let m = 0; m < allCards.length; m += 1) {
                    if (m !== i && m !== j) {
                        currCards.push(allCards[m]);
                    }
                }
                const currPattern = new Pattern_1.default(currCards);
                if (currPattern.compare(maxPattern) === 1) {
                    maxPattern = currPattern;
                }
            }
        }
        return maxPattern;
    }
    static winnerFormat(pattern, ...winners) {
        if (pattern === null) {
            return `${winners[0].username} wins!`;
        }
        const patternName = pattern.name;
        if (winners.length > 1) {
            return `${winners.map(winner => winner.username).join(', ')} win by ${patternName}`;
        }
        else {
            return `${winners[0].username} wins by ${patternName}`;
        }
    }
    get activePlayers() {
        return this.players.filter(player => !player.isFolded);
    }
    addPlayer(player) {
        this.players.push(new Player_1.default(player.username, player.chip));
    }
    disconnect(username) {
        if (this.started) {
            const player = this.getPlayerByName(username);
            if (player) {
                player.isOffline = true;
            }
            if (this.currentPlayer.username === username) {
                this.triggerEvent(username, 'fold');
            }
        }
        else {
            this.removePlayer(username);
        }
    }
    getPlayerByName(username) {
        for (let i = 0; i < this.players.length; i += 1) {
            if (this.players[i].username === username) {
                return this.players[i];
            }
        }
        return undefined;
    }
    removePlayer(username) {
        for (let i = this.players.length - 1; i >= 0; i -= 1) {
            if (this.players[i].username === username) {
                this.players.splice(i, 1);
                this.room.roomBroadcast('leave', username);
            }
        }
    }
    startGame() {
        if (this.players.length !== 3) {
            this.room.roomBroadcast('announcement', 'Waiting for players...');
            return;
        }
        this.started = true;
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
    setStartingPlayer() {
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
    existOnlyOne() {
        return this.players.filter(player => !player.isFolded).length === 1;
    }
    winMoney(...winners) {
        const award = Math.floor(this.pot / winners.length);
        winners.forEach((player) => {
            this.room.roomBroadcast('addMoney', {
                username: player.username,
                chip: award,
            });
            updateChip(player.username, award);
        });
    }
    revealHand() {
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
    close() {
        this.started = false;
        this.room.roomBroadcast('inTurn', '');
        if (this.existOnlyOne()) {
            this.winMoney(this.activePlayers[0]);
            this.room.roomBroadcast('announcement', Game.winnerFormat(null, ...this.activePlayers));
        }
        else {
            this.revealHand();
            const winners = [];
            let winnerPattern = null;
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
                }
                else if (compare === 1) {
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
    endGame() {
        this.room.roomBroadcast('endGame', null);
        this.deck.init();
        this.pot = 0;
        this.publicCards = [];
        this.started = false;
        this.checkTimes = 0;
        this.raiseTimes = 0;
        this.betNumber = 0;
        this.round = Round.Preflop;
        this.players.forEach((player) => {
            player.reset();
        });
        let enoughPlayer = true;
        for (let i = this.players.length - 1; i >= 0; i -= 1) {
            if (this.players[i].isOffline) {
                this.removePlayer(this.players[i].username);
                enoughPlayer = false;
            }
        }
        if (enoughPlayer) {
            setTimeout(() => {
                this.room.roomBroadcast('announcement', 'Game will begin in seconds...');
            }, 5000);
            setTimeout(() => {
                this.startGame();
            }, 10000);
        }
        else {
            this.room.roomBroadcast('announcement', 'Waiting for players...');
        }
    }
    setNextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.currentPlayer = this.players[this.currentPlayerIndex];
        if (this.currentPlayer.isOffline) {
            this.triggerEvent(this.currentPlayer.username, 'fold');
            return;
        }
        if (this.currentPlayer.isFolded) {
            this.checkTimes += 1;
            this.setNextPlayer();
        }
    }
    processPlayer() {
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
    setNextRound() {
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
    bet(chip) {
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
    deal(player, card) {
        player.receiveCard(card);
        this.room.playerEmit(player.username, 'card', {
            username: player.username,
            card,
        });
    }
    initDeal(player) {
        this.deal(player, this.deck.draw());
        this.deal(player, this.deck.draw());
    }
    addPublicCard() {
        const card = this.deck.draw();
        this.publicCards.push(card);
        this.room.roomBroadcast('publicCard', card);
    }
    triggerEvent(username, eventName) {
        if (username !== this.currentPlayer.username) {
            return;
        }
        this.room.roomBroadcast('announcement', `${username}: ${eventName}`);
        this[eventName]();
        let aborted = false;
        if (eventName === 'fold' && this.existOnlyOne()) {
            aborted = true;
            this.close();
        }
        else if (eventName === 'call') {
            const isLastCall = !this.activePlayers.some(player => player.betChips !== this.currentPlayer.betChips);
            if (isLastCall
                && ((this.round === Round.Preflop && this.currentPlayer.isBigBlind())
                    || (this.round !== Round.Preflop && isLastCall))) {
                this.setNextRound();
                aborted = true;
            }
        }
        if (this.started && !aborted) {
            this.setNextPlayer();
            this.processPlayer();
        }
    }
    fold() {
        this.currentPlayer.isFolded = true;
        this.room.roomBroadcast('fold', this.currentPlayer.username);
    }
    check() {
        this.checkTimes += 1;
    }
    raise() {
        this.raiseTimes += 1;
        this.checkTimes = 0;
        this.bet(this.betNumber + this.limitBig - this.currentPlayer.betChips);
    }
    call() {
        this.bet(this.betNumber - this.currentPlayer.betChips);
        this.checkTimes += 1;
    }
};
//# sourceMappingURL=index.js.map