// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Global variables to manage game state
let balance = 25000; // Starting balance
let deck = [];
let players = [];
let dealerHand = [];
let gameState = 'waiting'; // Possible states: 'waiting', 'betting', 'playing', 'finished'

// DOM elements
const balanceElement = document.getElementById('balance');
const betAmountElement = document.getElementById('bet-amount');
const newGameButton = document.getElementById('new-game-button');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const placeBetButton = document.getElementById('place-bet-button');
const playerHandElement = document.getElementById('player-hand');
const dealerHandElement = document.getElementById('dealer-hand');
const messageElement = document.getElementById('message');

/**
 * Initializes the game by setting up the initial state and event listeners.
 */
function init() {
    updateBalance();
    setButtonState();
    newGameButton.addEventListener('click', startNewGame);
    hitButton.addEventListener('click', hit);
    standButton.addEventListener('click', stand);
    placeBetButton.addEventListener('click', placeBet);
}

/**
 * Renders the current state of the game to the user interface.
 */
function render() {
    displayHand(players[0].hand, playerHandElement); // Display the first player's hand
    displayHand(dealerHand, dealerHandElement);
    updateBalance();
    setButtonState();
}

/**
 * Creates and shuffles a new deck of cards.
 */
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

/**
 * Calculates the value of a card.
 * @param {Object} card - The card object.
 * @returns {number} - The value of the card.
 */
function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    if (card.value === 'A') return playerChoosesAceValue(); // Player chooses the value for Ace
    return parseInt(card.value, 10);
}

/**
 * Prompts the player to choose the value of an Ace card.
 * @returns {number} - The chosen value of the Ace (1 or 11).
 */
function playerChoosesAceValue() {
    let aceValue;
    while (![1, 11].includes(aceValue)) {
        aceValue = parseInt(prompt("You've been dealt an Ace! Choose its value: 1 or 11", "11"), 10);
    }
    return aceValue;
}

/**
 * Calculates the total value of a hand.
 * @param {Array} hand - The array of card objects.
 * @returns {number} - The total value of the hand.
 */
function calculateHandValue(hand) {
    let value = hand.reduce((sum, card) => sum + getCardValue(card), 0);
    let aces = hand.filter(card => card.value === 'A').length;
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    return value;
}

/**
 * Displays the hand of cards in the specified DOM element.
 * @param {Array} hand - The array of card objects.
 * @param {HTMLElement} element - The DOM element to display the hand in.
 */
function displayHand(hand, element) {
    element.innerHTML = hand.map(card => `${card.value} of ${card.suit}`).join('<br>');
}

/**
 * Updates the displayed balance.
 */
function updateBalance() {
    balanceElement.textContent = balance;
}

/**
 * Displays a message to the user in the console.
 * @param {string} message - The message to display.
 */
function displayMessage(message) {
    console.log(message);
    messageElement.textContent = message;
}

/**
 * Sets the enabled/disabled state of buttons based on the current game state.
 */
function setButtonState() {
    if (gameState === 'waiting') {
        newGameButton.disabled = false;
        hitButton.disabled = true;
        standButton.disabled = true;
        placeBetButton.disabled = false;
    } else if (gameState === 'betting') {
        newGameButton.disabled = true;
        hitButton.disabled = true;
        standButton.disabled = true;
        placeBetButton.disabled = false;
    } else if (gameState === 'playing') {
        newGameButton.disabled = true;
        hitButton.disabled = false;
        standButton.disabled = false;
        placeBetButton.disabled = true;
    } else if (gameState === 'finished') {
        newGameButton.disabled = false;
        hitButton.disabled = true;
        standButton.disabled = true;
        placeBetButton.disabled = true;
    }
}

/**
 * Starts a new game by resetting the hands and creating a new deck.
 * The game transitions from 'waiting' to 'betting' state.
 */
function startNewGame() {
    if (gameState !== 'waiting') {
        displayMessage('Please finish the current game before starting a new one.');
        return;
    }
    // Prompt players to enter their names and create player objects
    const numPlayers = parseInt(prompt("Enter the number of players (1 or more):", "1"), 10);
    players = [];
    for (let i = 1; i <= numPlayers; i++) {
        const name = prompt(`Enter name for Player ${i}:`);
        players.push({
            name: name,
            hand: [],
            bet: 0,
            status: 'active' // Possible statuses: 'active', 'busted', '21', 'stand'
        });
    }
    dealerHand = [];
    createDeck();
    dealInitialCards();
    displayMessage('Game started. Place your bets.');
    gameState = 'betting';
    render();
}

/**
 * Deals the initial cards to the players and the dealer.
 */
function dealInitialCards() {
    players.forEach(player => {
        player.hand = [deck.pop(), deck.pop()];
    });
    dealerHand = [deck.pop(), deck.pop()];
}

/**
 * Handles the player's decision to hit.
 * A new card is dealt to the player, and the hand is evaluated.
 */
function hit() {
    if (gameState !== 'playing') {
        displayMessage('You can only hit while the game is in progress.');
        return;
    }
    const currentPlayer = players.find(player => player.status === 'active');
    if (!currentPlayer) {
        displayMessage('No active players to hit.');
        return;
    }
    currentPlayer.hand.push(deck.pop());
    render();
    const playerValue = calculateHandValue(currentPlayer.hand);
    if (playerValue > 21) {
        currentPlayer.status = 'busted';
        displayMessage(`${currentPlayer.name} busts! You lose.`);
        balance -= currentPlayer.bet;
    } else if (playerValue === 21) {
        currentPlayer.status = '21';
        displayMessage(`${currentPlayer.name} hits 21! You win 1.5x your bet.`);
        balance += currentPlayer.bet * 1.5;
    }
    checkAllPlayersStatus();
}

/**
 * Handles the player's decision to stand.
 * The game progresses to the next player or dealer phase.
 */
function stand() {
    if (gameState !== 'playing') {
        displayMessage('You can only stand while the game is in progress.');
        return;
    }
    const currentPlayer = players.find(player => player.status === 'active');
    if (currentPlayer) {
        currentPlayer.status = 'stand';
        displayMessage(`${currentPlayer.name} stands.`);
        checkAllPlayersStatus();
    }
}

/**
 * Checks if all players have made their move (stand or bust).
 * If all players have acted, the dealer's turn begins.
 */
function checkAllPlayersStatus() {
    if (players.every(player => player.status !== 'active')) {
        dealerPlay();
    }
}

/**
 * Handles the dealer's turn.
 * The dealer hits until reaching at least 17 or busting.
 */
function dealerPlay() {
    gameState = 'finished';
    render();
    while (calculateHandValue(dealerHand) < 17) {
        dealerHand.push(deck.pop());
        render();
    }
    evaluateGameResults();
}

/**
 * Evaluates the game results based on the dealer's hand and each player's hand.
 */
function evaluateGameResults() {
    const dealerValue = calculateHandValue(dealerHand);
    if (dealerValue > 21) {
        displayMessage('Dealer busts! Players with bets win.');
        players.forEach(player => {
            if (player.status === 'stand' || player.status === '21') {
                balance += player.bet;
            }
        });
    } else {
        players.forEach(player => {
            if (player.status === 'stand' || player.status === '21') {
                const playerValue = calculateHandValue(player.hand);
                if (playerValue > dealerValue) {
                    displayMessage(`${player.name} wins!`);
                    balance += player.bet;
                } else if (playerValue < dealerValue) {
                    displayMessage(`${player.name} loses.`);
                    balance -= player.bet;
                } else {
                    displayMessage(`${player.name} ties.`);
                }
            }
        });
    }
    updateBalance();
}

/**
 * Places the bet for the player and transitions the game state.
 */
function placeBet() {
    if (gameState !== 'betting') {
        displayMessage('You can only place a bet while the game is in the betting state.');
        return;
    }
    const betAmount = parseInt(betAmountElement.value, 10);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        displayMessage('Invalid bet amount.');
        return;
    }
    players.forEach(player => {
        player.bet = betAmount;
    });
    displayMessage('Bets placed. Game is starting.');
    gameState = 'playing';
    render();
}
