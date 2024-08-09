document.addEventListener('DOMContentLoaded', init);

let balance = 25000; // Starting balance
let deck = [];
let originalDeck = [];
let players = [];
let dealerHand = [];
let gameState = 'waiting'; // Possible states: 'waiting', 'betting', 'playing', 'finished'

const balanceElement = document.getElementById('balance');
const betAmountElement = document.getElementById('bet-amount');
const newGameButton = document.getElementById('new-game-button');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const placeBetButton = document.getElementById('place-bet-button');
const restartGameButton = document.getElementById('restart-game-button');
const playerHandElement = document.getElementById('player-hand');
const dealerHandElement = document.getElementById('dealer-hand');
const messageElement = document.getElementById('message');
const setupSection = document.getElementById('setup-section');
const gameSection = document.getElementById('game-section');
const startGameButton = document.getElementById('start-game-button');
const numPlayersInput = document.getElementById('num-players');
const playerNamesDiv = document.getElementById('player-names');

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function init() {
    startGameButton.addEventListener('click', startGameSetup);
    newGameButton.addEventListener('click', startNewGame);
    hitButton.addEventListener('click', hit);
    standButton.addEventListener('click', stand);
    placeBetButton.addEventListener('click', placeBet);
    restartGameButton.addEventListener('click', restartGame);

    setupSection.style.display = 'block';
    gameSection.style.display = 'none';
}

function startGameSetup() {
    const numPlayers = parseInt(numPlayersInput.value, 10);
    const playerNames = [];
    for (let i = 0; i < numPlayers; i++) {
        const nameInput = document.getElementById(`player-${i}`);
        if (nameInput && nameInput.value.trim() !== '') {
            playerNames.push(nameInput.value.trim());
        } else {
            displayMessage('Please enter all player names.');
            return;
        }
    }

    // Initialize player data
    players = playerNames.map(name => ({
        name: name,
        hand: [],
        bet: 0,
        status: 'active'
    }));

    // Hide setup and show game section
    setupSection.style.display = 'none';
    gameSection.style.display = 'block';

    // Reset and start a new game
    startNewGame();
}

function startNewGame() {
    if (gameState !== 'waiting' && gameState !== 'finished') {
        displayMessage('Please finish the current game before starting a new one.');
        return;
    }

    dealerHand = [];
    originalDeck = buildOriginalDeck(); // Build the original deck
    deck = getNewShuffledDeck(); // Get a new shuffled deck
    dealInitialCards();
    displayMessage('Game started. Place your bets.');
    gameState = 'betting';
    updateBalance();
    render();
    setButtonState();
}

function render() {
    playerHandElement.innerHTML = players.map(player => `
        <div>${player.name}'s hand: ${player.hand.map(card => getCardHTML(card)).join(', ')}</div>
    `).join('<br>');
    dealerHandElement.innerHTML = dealerHand.map(card => getCardHTML(card)).join(', ');
    updateBalance();
    setButtonState();
}

function getCardHTML(card) {
    const cardClass = `card ${card.face}`;
    return `<div class="${cardClass}"></div>`;
}

function renderDeckInContainer(deck, container) {
    container.innerHTML = '';
    let cardsHtml = '';
    deck.forEach(card => {
        cardsHtml += `<div class="card ${card.face}"></div>`;
    });
    container.innerHTML = cardsHtml;
}

function buildOriginalDeck() {
    const deck = [];
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({
                face: `${suit}-${rank}`,
                value: Number(rank) || (rank === 'A' ? 11 : 10)
            });
        });
    });
    return deck;
}

function getNewShuffledDeck() {
    const tempDeck = [...originalDeck];
    const newShuffledDeck = [];
    while (tempDeck.length) {
        const rndIdx = Math.floor(Math.random() * tempDeck.length);
        newShuffledDeck.push(tempDeck.splice(rndIdx, 1)[0]);
    }
    return newShuffledDeck;
}

function createDeck() {
    deck = getNewShuffledDeck(); // Shuffle the deck when creating
}

function dealInitialCards() {
    players.forEach(player => {
        player.hand = [deck.pop(), deck.pop()];
    });
    dealerHand = [deck.pop(), deck.pop()];
}

function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    if (card.value === 'A') return playerChoosesAceValue();
    return parseInt(card.value, 10);
}

function playerChoosesAceValue() {
    let aceValue;
    while (![1, 11].includes(aceValue)) {
        aceValue = parseInt(prompt("You've been dealt an Ace! Choose its value: 1 or 11", "11"), 10);
    }
    return aceValue;
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

function updateBalance() {
    balanceElement.textContent = balance;
}

function displayMessage(message) {
    messageElement.textContent = message;
}

function setButtonState() {
    if (gameState === 'waiting') {
        newGameButton.style.display = 'none';
        hitButton.style.display = 'none';
        standButton.style.display = 'none';
        placeBetButton.style.display = 'none';
        restartGameButton.style.display = 'none';
        startGameButton.style.display = 'block';
    } else if (gameState === 'betting') {
        newGameButton.style.display = 'none';
        hitButton.style.display = 'none';
        standButton.style.display = 'none';
        placeBetButton.style.display = 'block';
        restartGameButton.style.display = 'none';
        startGameButton.style.display = 'none';
    } else if (gameState === 'playing') {
        newGameButton.style.display = 'none';
        hitButton.style.display = 'block';
        standButton.style.display = 'block';
        placeBetButton.style.display = 'none';
        restartGameButton.style.display = 'none';
        startGameButton.style.display = 'none';
    } else if (gameState === 'finished') {
        newGameButton.style.display = 'block';
        hitButton.style.display = 'none';
        standButton.style.display = 'none';
        placeBetButton.style.display = 'none';
        restartGameButton.style.display = 'block';
        startGameButton.style.display = 'none';
    }
}

function hit() {
    if (gameState !== 'playing') {
        displayMessage('You can only hit during the playing state.');
        return;
    }
    const player = players[0];
    player.hand.push(deck.pop());
    const playerValue = calculateHandValue(player.hand);
    if (playerValue > 21) {
        displayMessage('Bust! You lose.');
        player.status = 'busted';
        balance -= player.bet;
        endRound();
    } else {
        render();
    }
}

function stand() {
    if (gameState !== 'playing') {
        displayMessage('You can only stand during the playing state.');
        return;
    }
    // Dealer's turn
    dealerPlay();
    evaluateGame();
    render();
}

function dealerPlay() {
    while (calculateHandValue(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }
}

function evaluateGame() {
    const dealerValue = calculateHandValue(dealerHand);
    players.forEach(player => {
        if (player.status === 'busted') {
            displayMessage(`${player.name} busts and loses their bet.`);
        } else {
            const playerValue = calculateHandValue(player.hand);
            if (dealerValue > 21 || playerValue > dealerValue) {
                displayMessage(`${player.name} wins!`);
                balance += player.bet;
            } else if (playerValue < dealerValue) {
                displayMessage(`${player.name} loses.`);
                balance -= player.bet;
            } else {
                displayMessage(`${player.name} ties with the dealer.`);
            }
        }
    });
    gameState = 'finished';
    setButtonState();
}

function placeBet() {
    if (gameState !== 'betting') {
        displayMessage('You can only place bets during the betting state.');
        return;
    }
    const betAmount = parseInt(betAmountElement.value, 10);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        displayMessage('Invalid bet amount.');
        return;
    }
    players[0].bet = betAmount;
    gameState = 'playing';
    render();
}

function restartGame() {
    gameState = 'waiting';
    setupSection.style.display = 'block';
    gameSection.style.display = 'none';
}

function endRound() {
    gameState = 'finished';
    setButtonState();
    render();
}
