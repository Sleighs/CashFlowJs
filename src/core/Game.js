class Game {
    constructor() {
        this.players = [];
        this.playerCount = 1;
        this.turnCount = 1;
        this.currentPlayer = 1;
        this.saveKey = '';
        this.dreamPhaseActive = true;
    }

    get currentPlayerIndex() {
        return this.currentPlayer - 1;
    }

    get previousPlayer() {
        if (this.currentPlayer === 1) {
            return this.playerCount;
        }
        return this.currentPlayerIndex;
    }

    init() {
        // Initialize game state
        this.players = [];
        this.playerCount = 1;
        this.turnCount = 1;
        this.currentPlayer = 1;
        this.dreamPhaseActive = true;
    }

    nextTurn() {
        if (this.currentPlayer < this.playerCount) {
            this.currentPlayer++;
        } else {
            this.currentPlayer = 1;
        }
        this.turnCount++;
    }

    rollDice(dieCount) {
        let total = 0;
        for (let i = 1; i <= dieCount; i++) {
            const die = Math.floor(Math.random() * 6) + 1;
            total += die;
        }
        return total;
    }

    movePlayer(dieCount) {
        const player = this.players[this.currentPlayerIndex];
        const previousPosition = player.position;
        const dice = this.rollDice(dieCount);
        
        // Update position
        if (player.position + dice <= 23) {
            player.position += dice;
        } else {
            const x = player.position + dice;
            player.position = x - 23;
        }

        // Handle paycheck if passing payday
        if (previousPosition < 5 && player.position >= 5) {
            player.cash += player.payday;
        } else if (previousPosition < 13 && player.position >= 13) {
            player.cash += player.payday;
        } else if (previousPosition < 21 && player.position + dice >= 21) {
            player.cash += player.payday;
        }

        return {
            dice,
            newPosition: player.position
        };
    }
}

export default Game; 