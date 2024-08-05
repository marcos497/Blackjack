let deck = [];
let players = [];
let dealer = {};
let currentPlayer = 0;
let outcome = null;
let bankroll = 20000;
let bet = 0;

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function getNewShuffledDeck() {
    let newDeck = [];
    for (let suit of suits) {
        for (let value of values) {
            newDeck.push({ value, suit });
        }
    }
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
}

function getHandTotal(hand) {
    let total = 0;
    let aces = 0;

    for (let card of hand) {
        if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
            total += 10;
        } else if (card.value === 'A') {
            total += 11;
            aces += 1;
        } else {
            total += parseInt(card.value);
        }
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces -= 1;
    }

    return total;
}

function render() {
    const deckContainer = document.getElementById('deck-container');
    deckContainer.innerHTML = '';
    for (let card of deck) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.textContent = `${card.value} of ${card.suit}`;
        deckContainer.appendChild(cardDiv);
    }

    const dealerCards = document.getElementById('dealer-cards');
    dealerCards.innerHTML = '';
    for (let card of dealer.hand) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.textContent = `${card.value} of ${card.suit}`;
        dealerCards.appendChild(cardDiv);
    }

    const playersContainer = document.getElementById('players-container');
    playersContainer.innerHTML = '';
    players.forEach((player, index) => {
        const playerArea = document.createElement('div');
        playerArea.classList.add('player-area');
        playerArea.innerHTML = `<h3>Player ${index + 1}</h3>`;
        const playerCards = document.createElement('div');
        playerCards.classList.add('card-container');
        for (let card of player.hand) {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');
            cardDiv.textContent = `${card.value} of ${card.suit}`;
            playerCards.appendChild(cardDiv);
        }
        playerArea.appendChild(playerCards);
        playersContainer.appendChild(playerArea);
    });

    document.getElementById('status').textContent = outcome || '';
    document.getElementById('balance').textContent = `Balance: $${bankroll}`;
}

function init() {
    document.getElementById('betting-controls').style.display = 'none';
    document.getElementById('player-controls').style.display = 'none';
    document.getElementById('controls').style.display = 'block';
    outcome = null;
    dealer = { hand: [], total: 0 };
    players = [];
    currentPlayer = 0;
    bankroll = 20000;
    bet = 0;
    render();
}

function startGame() {
    const numPlayers = parseInt(document.getElementById('num-players').value);
    players = Array(numPlayers).fill().map(() => ({ hand: [], total: 0 }));
    document.getElementById('controls').style.display = 'none';
    document.getElementById('betting-controls').style.display = 'block';
    render();
}

function handleDeal() {
    outcome = null;
    deck = getNewShuffledDeck();
    dealer.hand = [deck.pop(), deck.pop()];
    players.forEach(player => {
        player.hand = [deck.pop(), deck.pop()];
        player.total = getHandTotal(player.hand);
    });
    dealer.total = getHandTotal(dealer.hand);

    if (dealer.total === 21) {
        outcome = 'Dealer has Blackjack!';
        settleBet();
    } else if (players.some(player => player.total === 21)) {
        outcome = 'Player has Blackjack!';
        settleBet();
    }

    document.getElementById('betting-controls').style.display = 'none';
    document.getElementById('player-controls').style.display = 'block';
    render();
}

function handleHit() {
    if (currentPlayer >= players.length) {
        return;
    }
    const player = players[currentPlayer];
    player.hand.push(deck.pop());
    player.total = getHandTotal(player.hand);

    if (player.total > 21) {
        outcome = `Player ${currentPlayer + 1} is bust!`;
        currentPlayer++;
    }

    render();
}

function handleStand() {
    currentPlayer++;
    if (currentPlayer >= players.length) {
        while (dealer.total < 17) {
            dealer.hand.push(deck.pop());
            dealer.total = getHandTotal(dealer.hand);
        }

        if (dealer.total > 21) {
            outcome = 'Dealer is bust! Players win!';
        } else {
            outcome = 'Dealer stands. Determining winners...';
        }
    }

    render();
}

function settleBet() {
    if (outcome === 'Dealer has Blackjack!' || dealer.total === 21) {
        bankroll -= bet;
    } else if (players.some(player => player.total === 21) || outcome === 'Player has Blackjack!') {
        bankroll += bet * 1.5;
    } else if (dealer.total > 21 || players.some(player => player.total > dealer.total)) {
        bankroll += bet;
    } else if (players.every(player => player.total < dealer.total)) {
        bankroll -= bet;
    }
    bet = 0;
    render();
}

document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('place-bet').addEventListener('click', () => {
    bet = parseInt(document.getElementById('bet-amount').value);
    handleDeal();
});
document.getElementById('hit-button').addEventListener('click', handleHit);
document.getElementById('stand-button').addEventListener('click', handleStand);
document.getElementById('reset-button').addEventListener('click', init);

init();
