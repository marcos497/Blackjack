document.addEventListener('DOMContentLoaded', () => {
    const deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let playerHand = [];
    let dealerHand = [];
    let gameOver = false;

    function createDeck() {
        for (let suit of suits) {
            for (let value of values) {
                deck.push({ suit, value });
            }
        }
    }

    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function startGame() {
        deck.length = 0; // Reset the deck
        createDeck();
        shuffleDeck();
        playerHand = [deck.pop(), deck.pop()];
        dealerHand = [deck.pop(), deck.pop()];
        gameOver = false;
        document.getElementById('status').textContent = '';
        renderHands();
        checkForEndOfGame();
    }

    function calculateHandValue(hand) {
        let value = 0;
        let aceCount = 0;
        for (let card of hand) {
            if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
                value += 10;
            } else if (card.value === 'A') {
                value += 11;
                aceCount++;
            } else {
                value += parseInt(card.value);
            }
        }
        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }
        return value;
    }

    function renderHands() {
        document.getElementById('player-cards').innerHTML = playerHand.map(card => `${card.value} of ${card.suit}`).join('<br>');
        document.getElementById('dealer-cards').innerHTML = dealerHand.map(card => `${card.value} of ${card.suit}`).join('<br>');
    }

    function checkForEndOfGame() {
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);

        if (playerValue === 21) {
            document.getElementById('status').textContent = 'Blackjack! You win!';
            gameOver = true;
            return;
        }

        if (playerValue > 21) {
            document.getElementById('status').textContent = 'You busted! Dealer wins.';
            gameOver = true;
            return;
        }

        if (dealerValue > 21) {
            document.getElementById('status').textContent = 'Dealer busted! You win!';
            gameOver = true;
            return;
        }

        if (gameOver && dealerValue <= 21 && playerValue <= 21) {
            if (dealerValue > playerValue) {
                document.getElementById('status').textContent = 'Dealer wins.';
            } else if (dealerValue < playerValue) {
                document.getElementById('status').textContent = 'You win!';
            } else {
                document.getElementById('status').textContent = 'It\'s a tie!';
            }
        }
    }

    function dealerPlays() {
        while (calculateHandValue(dealerHand) < 17) {
            dealerHand.push(deck.pop());
        }
        renderHands();
        checkForEndOfGame();
    }

    document.getElementById('hit-button').addEventListener('click', () => {
        if (!gameOver) {
            playerHand.push(deck.pop());
            renderHands();
            checkForEndOfGame();
        }
    });

    document.getElementById('stand-button').addEventListener('click', () => {
        if (!gameOver) {
            gameOver = true;
            dealerPlays();
        }
    });

    document.getElementById('reset-button').addEventListener('click', startGame);

    startGame();
});




//functionality that places bets and tracks players balances
let balance = 1000;
let currentBet = 0;

document.getElementById('place-bet').addEventListener('click', () => {
    const betAmount = parseInt(document.getElementById('bet-amount').value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        alert('Invalid bet amount');
        return;
    }
    currentBet = betAmount;
    balance -= currentBet;
    document.getElementById('balance').textContent = `Balance: $${balance}`;
    startGame();
});
