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
//   img function
function renderHands() {
    document.getElementById('player-cards').innerHTML = playerHand.map(card => 
        `<img src="images/cards/${card.value}_of_${card.suit}.png" alt="${card.value} of ${card.suit}">`
    ).join('');
    document.getElementById('dealer-cards').innerHTML = dealerHand.map(card => 
        `<img src="images/cards/${card.value}_of_${card.suit}.png" alt="${card.value} of ${card.suit}">`
    ).join('');
}
//  improved msgs 
function checkForEndOfGame() {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);

    if (playerValue === 21 && playerHand.length === 2) {
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

    if (gameOver) {
        if (dealerValue > 21 || playerValue > dealerValue) {
            document.getElementById('status').textContent = 'You win!';
        } else if (dealerValue === playerValue) {
            document.getElementById('status').textContent = 'It\'s a tie!';
        } else {
            document.getElementById('status').textContent = 'Dealer wins.';
        }
    }
}

// Audio effeccts 
const hitSound = new Audio('sounds/hit.mp3');
const winSound = new Audio('sounds/win.mp3');
const loseSound = new Audio('sounds/lose.mp3');

document.getElementById('hit-button').addEventListener('click', () => {
    if (!gameOver) {
        playerHand.push(deck.pop());
        renderHands();
        hitSound.play();
        checkForEndOfGame();
    }
});

function checkForEndOfGame() {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);

    if (playerValue === 21 && playerHand.length === 2) {
        document.getElementById('status').textContent = 'Blackjack! You win!';
        winSound.play();
        gameOver = true;
        return;
    }

    if (playerValue > 21) {
        document.getElementById('status').textContent = 'You busted! Dealer wins.';
        loseSound.play();
        gameOver = true;
        return;
    }

    if (dealerValue > 21) {
        document.getElementById('status').textContent = 'Dealer busted! You win!';
        winSound.play();
        gameOver = true;
        return;
    }

    if (gameOver) {
        if (dealerValue > 21 || playerValue > dealerValue) {
            document.getElementById('status').textContent = 'You win!';
            winSound.play();
        } else if (dealerValue === playerValue) {
            document.getElementById('status').textContent = 'It\'s a tie!';
        } else {
            document.getElementById('status').textContent = 'Dealer wins.';
            loseSound.play();
        }
    }
}
 
// handling mutliple players 

const numPlayers = 5;
const players = [];
const playerHands = Array.from({ length: numPlayers }, () => []);
let dealerHand = [];

function createPlayers() {
    for (let i = 0; i < numPlayers; i++) {
        players.push({ id: i, name: `Player ${i + 1}` });
    }
}


// start game function 

function startGame() {
    deck.length = 0;
    createDeck();
    shuffleDeck();
    playerHands.forEach(hand => hand.length = 0); // Clear previous hands
    dealerHand = [];
    createPlayers();
    
    for (let i = 0; i < 2; i++) {
        playerHands.forEach(hand => hand.push(deck.pop()));
        dealerHand.push(deck.pop());
    }

    renderHands();
    document.getElementById('status').textContent = '';
    gameOver = false;
}


// render hand to multiple players 
function renderHands() {
    // Render dealer's hand
    document.getElementById('dealer-cards').innerHTML = dealerHand.map(card => 
        `<img src="images/cards/${card.value}_of_${card.suit}.png" alt="${card.value} of ${card.suit}">`
    ).join('');

    // Render each player's hand
    const playersContainer = document.getElementById('players-container');
    playersContainer.innerHTML = players.map((player, index) => `
        <div class="player-area" id="player-${index}">
            <h3>${player.name}</h3>
            <div class="card-container">
                ${playerHands[index].map(card => 
                    `<img src="images/cards/${card.value}_of_${card.suit}.png" alt="${card.value} of ${card.suit}">`
                ).join('')}
            </div>
        </div>
    `).join('');
}


// handle player actions 

let currentPlayerIndex = 0;

function getCurrentPlayer() {
    return playerHands[currentPlayerIndex];
}

function handleHit() {
    if (!gameOver) {
        const currentPlayer = getCurrentPlayer();
        currentPlayer.push(deck.pop());
        renderHands();
        if (calculateHandValue(currentPlayer) > 21) {
            document.getElementById('status').textContent = `${players[currentPlayerIndex].name} busted!`;
            moveToNextPlayer();
        }
    }
}

function handleStand() {
    if (!gameOver) {
        moveToNextPlayer();
    }
}

function moveToNextPlayer() {
    if (currentPlayerIndex < numPlayers - 1) {
        currentPlayerIndex++;
        document.getElementById('status').textContent = `${players[currentPlayerIndex].name}'s turn.`;
    } else {
        gameOver = true;
        dealerPlays();
    }
    renderHands();
}

function dealerPlays() {
    while (calculateHandValue(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }
    renderHands();
    checkForEndOfGame();
}


// event listeners for modified actions 

document.getElementById('hit-button').addEventListener('click', handleHit);
document.getElementById('stand-button').addEventListener('click', handleStand);
document.getElementById('reset-button').addEventListener('click', startGame);
