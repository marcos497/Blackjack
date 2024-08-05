document.addEventListener('DOMContentLoaded', () => {
    const deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let playerHand = [];
    let dealerHand = [];

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
        createDeck();
        shuffleDeck();
        playerHand = [deck.pop(), deck.pop()];
        dealerHand = [deck.pop(), deck.pop()];
        renderHands();
    }

    function renderHands() {
        document.getElementById('player-cards').innerHTML = playerHand.map(card => `${card.value} of ${card.suit}`).join('<br>');
        document.getElementById('dealer-cards').innerHTML = dealerHand.map(card => `${card.value} of ${card.suit}`).join('<br>');
    }

    document.getElementById('hit-button').addEventListener('click', () => {
        playerHand.push(deck.pop());
        renderHands();
    });

    document.getElementById('stand-button').addEventListener('click', () => {
        // Implement stand logic
    });

    document.getElementById('reset-button').addEventListener('click', startGame);

    startGame();
});