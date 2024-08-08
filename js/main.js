document.addEventListener('DOMContentLoaded', () => {
    const balanceElement = document.getElementById('balance');
    const betAmountElement = document.getElementById('bet-amount');
    const newGameButton = document.getElementById('new-game-button');
    const hitButton = document.getElementById('hit-button');
    const standButton = document.getElementById('stand-button');
    const placeBetButton = document.getElementById('place-bet-button');
    const playerHandElement = document.getElementById('player-hand');
    const dealerHandElement = document.getElementById('dealer-hand');
    
    let balance = 1000;
    let betAmount = 10;
    let deck = [];
    let playerHand = [];
    let dealerHand = [];

    // Utility functions
    function createDeck() {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        deck = [];
        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value });
            }
        }
        deck = deck.sort(() => Math.random() - 0.5); // Shuffle deck
    }

    function getCardValue(card) {
        if (['J', 'Q', 'K'].includes(card.value)) return 10;
        if (card.value === 'A') return 11;
        return parseInt(card.value, 10);
    }

    function calculateHandValue(hand) {
        let value = hand.reduce((sum, card) => sum + getCardValue(card), 0);
        let aces = hand.filter(card => card.value === 'A').length;
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        return value;
    }

    function displayHand(hand, element) {
        element.innerHTML = hand.map(card => `${card.value} of ${card.suit}`).join('<br>');
    }

    function updateBalance() {
        balanceElement.textContent = balance;
    }

    function startNewGame() {
        playerHand = [];
        dealerHand = [];
        createDeck();
        dealInitialCards();
        displayHand(playerHand, playerHandElement);
        displayHand(dealerHand, dealerHandElement);
    }

    function dealInitialCards() {
        playerHand.push(deck.pop(), deck.pop());
        dealerHand.push(deck.pop(), deck.pop());
    }

    function hit() {
        playerHand.push(deck.pop());
        displayHand(playerHand, playerHandElement);
        if (calculateHandValue(playerHand) > 21) {
            alert('Player busts! You lose.');
            balance -= betAmount;
            updateBalance();
            startNewGame();
        }
    }

    function stand() {
        while (calculateHandValue(dealerHand) < 17) {
            dealerHand.push(deck.pop());
            displayHand(dealerHand, dealerHandElement);
        }
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);
        if (dealerValue > 21 || playerValue > dealerValue) {
            alert('Player wins!');
            balance += betAmount;
        } else if (playerValue < dealerValue) {
            alert('Dealer wins!');
            balance -= betAmount;
        } else {
            alert('It\'s a tie!');
        }
        updateBalance();
        startNewGame();
    }

    function placeBet() {
        const bet = parseInt(betAmountElement.value, 10);
        if (bet > 0 && bet <= balance) {
            betAmount = bet;
        } else {
            alert('Invalid bet amount');
        }
    }

    newGameButton.addEventListener('click', startNewGame);
    hitButton.addEventListener('click', hit);
    standButton.addEventListener('click', stand);
    placeBetButton.addEventListener('click', placeBet);

    // Initial setup
    updateBalance();
});
