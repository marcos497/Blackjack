// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Global variables to manage game state
let balance = 1000;
let betAmount = 10;
let deck = [];
let playerHand = [];
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
    displayHand(playerHand, playerHandElement);
    displayHand(dealerHand, dealerHandElement);
    updateBalance();
    setButtonState();
}

/**
 * Creates and shuffles a new deck of cards.
 * The deck is populated with standard 52 cards (4 suits, 13 values each).
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
 * King, Queen, and Jack are worth 10 points.
 * Ace can be worth 1 or 11 points, depending on the player's choice.
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
    do {
        aceValue = parseInt(prompt("You've been dealt an Ace! Choose its value: 1 or 11", "11"), 10);
    } while (![1, 11].includes(aceValue)); // Ensures valid input
    return aceValue;
}

/**
 * Calculates the total value of a hand.
 * The value adjusts for Aces if necessary to avoid busting.
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
 * Each card is displayed as a string combining its value and suit.
 * @param {Array} hand - The array of card objects.
 * @param {HTMLElement} element - The DOM element to display the hand in.
 */
function displayHand(hand, element) {
    element.innerHTML = hand.map(card => `${card.value} of ${card.suit}`).join('<br>');
}

/**
 * Updates the displayed balance.
 * The player's current balance is shown in the DOM.
 */
function updateBalance() {
    balanceElement.textContent = balance;
}

/**
 * Displays a message to the user.
 * This is used to provide feedback on game progress and decisions.
 * @param {string} message - The message to display.
 */
function displayMessage(message) {
    messageElement.textContent = message;
}

/**
 * Sets the enabled/disabled state of buttons based on the current game state.
 * Buttons are enabled only when relevant actions are available to the player.
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
    playerHand = [];
    dealerHand = [];
    createDeck();
    dealInitialCards();
    displayMessage('Game started. Place your bet.');
    gameState = 'betting';
    render();
}

/**
 * Deals the initial cards to the player and the dealer.
 * Each is dealt two cards at the beginning of the game.
 */
function dealInitialCards() {
    playerHand.push(deck.pop(), deck.pop());
    dealerHand.push(deck.pop(), deck.pop());
}

/**
 * Handles the player's decision to hit.
 * A new card is dealt to the player, and the hand is evaluated.
 * If the player busts (hand value exceeds 21), they lose.
 */
function hit() {
    if (gameState !== 'playing') {
        displayMessage('You can only hit while the game is in progress.');
        return;
    }
    playerHand.push(deck.pop());
    render();
    if (calculateHandValue(playerHand) > 21) {
        displayMessage('Player busts! You lose.');
        balance -= betAmount;
        gameState = 'finished';
        render();
        startNewGame();
    }
}

/**
 * Handles the player's decision to stand.
 * The dealer then plays, drawing cards until their hand is worth at least 17.
 * The outcome of the game is then determined.
 */
function stand() {
    if (gameState !== 'playing') {
        displayMessage('You can only stand while the game is in progress.');
        return;
    }
    while (calculateHandValue(dealerHand) < 17) {
        dealerHand.push(deck.pop());
        render();
    }
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    if (dealerValue > 21 || playerValue > dealerValue) {
        displayMessage('Player wins!');
        balance += betAmount;
    } else if (playerValue < dealerValue) {
        displayMessage('Dealer wins!');
        balance -= betAmount;
    } else {
        displayMessage('It\'s a tie!');
    }
    gameState = 'finished';
    render();
    startNewGame();
}

/**
 * Handles the player's bet placement.
 * The bet amount is validated, and the game moves to the 'playing' state.
 */
function placeBet() {
    if (gameState !== 'betting') {
        displayMessage('You can only place a bet at the beginning of the game.');
        return;
    }
    const bet = parseInt(betAmountElement.value, 10);
    if (bet > 0 && bet <= balance) {
        betAmount = bet;
        displayMessage('Bet placed. You can now start the game.');
        gameState = 'playing';
        render();
    } else {
        displayMessage('Invalid bet amount.');
    }
}
