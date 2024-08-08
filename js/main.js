document.addEventListener('DOMContentLoaded', () => {
    const balanceElement = document.getElementById('balance');
    const betAmountInput = document.getElementById('bet-amount');
    const playerHandDiv = document.getElementById('player-hand');
    const dealerHandDiv = document.getElementById('dealer-hand');

    let balance = parseInt(balanceElement.textContent);
    let betAmount = parseInt(betAmountInput.value);
    let playerHand = [];
    let dealerHand = [];

    function startNewGame() {
        playerHand = [];
        dealerHand = [];
        // Reset the player and dealer hands
        playerHandDiv.innerHTML = 'Player Hand:';
        dealerHandDiv.innerHTML = 'Dealer Hand:';
        // Deal initial cards
        dealCardToPlayer();
        dealCardToPlayer();
        dealCardToDealer();
        dealCardToDealer();
    }

    function dealCardToPlayer() {
        const card = drawCard();
        playerHand.push(card);
        updatePlayerHand();
    }

    function dealCardToDealer() {
        const card = drawCard();
        dealerHand.push(card);
        updateDealerHand();
    }

    function drawCard() {
        // Placeholder card drawing logic
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return `${value} of ${suit}`;
    }

    function updatePlayerHand() {
        playerHandDiv.innerHTML = `Player Hand: ${playerHand.join(', ')}`;
    }

    function updateDealerHand() {
        dealerHandDiv.innerHTML = `Dealer Hand: ${dealerHand.join(', ')}`;
    }

    document.getElementById('new-game-button').addEventListener('click', () => {
        startNewGame();
    });

    document.getElementById('hit-button').addEventListener('click', () => {
        dealCardToPlayer();
    });

    document.getElementById('stand-button').addEventListener('click', () => {
        // Implement stand functionality
        alert('Stand action not yet implemented.');
    });

    document.getElementById('place-bet-button').addEventListener('click', () => {
        betAmount = parseInt(betAmountInput.value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            alert('Invalid bet amount.');
            return;
        }
        balance -= betAmount;
        balanceElement.textContent = balance;
        // Implement bet placement functionality
        alert('Bet placed.');
    });
});
