/* Constants */
const MAX_PLAYERS = 8;
const STARTING_BALANCE = 35000;
const MIN_BET = 300;

/* State Variables */
let numPlayers;
let players = []; // Array to store player objects
let dealer = { hand: [], score: 0 }; // Dealer's hand and score
let currentPlayerIndex = 0;

/* Cached Elements */
const playerForm = document.getElementById('player-form');
const nameInputsDiv = document.getElementById('name-inputs');
const gameBoard = document.getElementById('game-board');
const playerInfoDiv = document.getElementById('player-info');
const dealerCardsDiv = document.getElementById('dealer-cards');
const stayBtn = document.getElementById('stay-btn');
const hitBtn = document.getElementById('hit-btn');
const resultMessage = document.getElementById('result-message');
const restartBtn = document.getElementById('restart-btn');

/* Event Listeners */
playerForm.addEventListener('submit', handlePlayerFormSubmit);
stayBtn.addEventListener('click', handleStay);
hitBtn.addEventListener('click', handleHit);
restartBtn.addEventListener('click', initialize);

/* Functions */

/* Initialize the game */
function initialize() {
    players = [];
    dealer = { hand: [], score: 0 };
    currentPlayerIndex = 0;
    gameBoard.classList.add('hidden');
    resultMessage.innerHTML = '';
    restartBtn.classList.add('hidden');
    showPlayerSetup();
}

/* Render the game state to the screen */
function render() {
    playerInfoDiv.innerHTML = '';
    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `<h3>${player.name}</h3><p>Bet: $${player.bet}</p><p>Balance: $${player.balance}</p><div class="cards">${renderHand(player.hand)}</div><p>Score: ${player.score}</p>`;
        playerInfoDiv.appendChild(playerDiv);
    });

    dealerCardsDiv.innerHTML = renderHand(dealer.hand);
    document.getElementById('dealer-score').textContent = `Score: ${dealer.score}`;
}

/* Handle the initial player form submission */
function handlePlayerFormSubmit(event) {
    event.preventDefault();
    numPlayers = document.getElementById('num-players').value;
    if (numPlayers < 1 || numPlayers > MAX_PLAYERS) {
        alert(`Please enter a number of players between 1 and ${MAX_PLAYERS}.`);
        return;
    }
    generateNameInputs(numPlayers);
}

/* Generate input fields for player names */
function generateNameInputs(num) {
    nameInputsDiv.innerHTML = '';
    for (let i = 0; i < num; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${i + 1} Name`;
        input.required = true;
        nameInputsDiv.appendChild(input);
    }
    const submitNamesBtn = document.createElement('button');
    submitNamesBtn.textContent = 'Submit Names';
    submitNamesBtn.addEventListener('click', handleNameSubmission);
    nameInputsDiv.appendChild(submitNamesBtn);
}

/* Handle the submission of player names */
function handleNameSubmission() {
    const nameInputs = nameInputsDiv.getElementsByTagName('input');
    for (let i = 0; i < nameInputs.length; i++) {
        players.push({
            name: nameInputs[i].value,
            hand: [],
            score: 0,
            balance: STARTING_BALANCE,
            bet: 0
        });
    }
    startBetting();
}

/* Start the betting phase */
function startBetting() {
    gameBoard.classList.remove('hidden');
    render();
    askForBet(currentPlayerIndex);
}

/* Ask the current player for a bet */
function askForBet(playerIndex) {
    const player = players[playerIndex];
    const bet = prompt(`${player.name}, place your bet (min $${MIN_BET}):`);
    if (bet < MIN_BET || bet > player.balance) {
        alert(`Invalid bet. Please bet an amount between $${MIN_BET} and your balance ($${player.balance}).`);
        askForBet(playerIndex);
        return;
    }
    player.bet = parseInt(bet);
    currentPlayerIndex++;
    if (currentPlayerIndex < players.length) {
        askForBet(currentPlayerIndex);
    } else {
        dealInitialCards();
    }
}

/* Deal the initial two cards to each player and the dealer */
function dealInitialCards() {
    currentPlayerIndex = 0;
    players.forEach(player => {
        player.hand = [drawCard(), drawCard()];
        player.score = calculateScore(player.hand);
    });
    dealer.hand = [drawCard(), drawCard()];
    dealer.score = calculateScore(dealer.hand);
    render();
    checkInitialScores();
}

/* Check the initial scores and handle Blackjacks/Busts */
function checkInitialScores() {
    players.forEach((player, index) => {
        if (player.score === 21) {
            player.balance += player.bet * 1.5;
            alert(`${player.name} hit Blackjack and won $${player.bet * 1.5}!`);
            removePlayerFromGame(index);
        } else if (player.score > 21) {
            player.balance -= player.bet;
            alert(`${player.name} busted and lost $${player.bet}.`);
            removePlayerFromGame(index);
        }
    });
    currentPlayerIndex = 0;
    if (players.length > 0) {
        promptPlayerAction();
    } else {
        dealerTurn();
    }
}

/* Remove a player from the game if they are out */
function removePlayerFromGame(index) {
    players.splice(index, 1);
}

/* Prompt the current player to hit or stay */
function promptPlayerAction() {
    const player = players[currentPlayerIndex];
    alert(`${player.name}, it's your turn. Your current score is ${player.score}.`);
    stayBtn.classList.remove('hidden');
    hitBtn.classList.remove('hidden');
}

/* Handle the stay action */
function handleStay() {
    currentPlayerIndex++;
    if (currentPlayerIndex < players.length) {
        promptPlayerAction();
    } else {
        dealerTurn();
    }
}

/* Handle the hit action */
function handleHit() {
    const player = players[currentPlayerIndex];
    player.hand.push(drawCard());
    player.score = calculateScore(player.hand);
    render();
    if (player.score > 21) {
        player.balance -= player.bet;
        alert(`${player.name} busted and lost $${player.bet}.`);
        removePlayerFromGame(currentPlayerIndex);
        if (players.length > 0) {
            promptPlayerAction();
        } else {
            dealerTurn();
        }
    } else {
        promptPlayerAction();
    }
}

/* Dealer's turn */
function dealerTurn() {
    stayBtn.classList.add('hidden');
    hitBtn.classList.add('hidden');
    while (dealer.score < 17) {
        dealer.hand.push(drawCard());
        dealer.score = calculateScore(dealer.hand);
        render();
    }
    evaluateGame();
}

/* Evaluate the game results */
function evaluateGame() {
    players.forEach(player => {
        if (player.score > dealer.score || dealer.score > 21) {
            player.balance += player.bet * 1;
            alert(`${player.name} won $${player.bet * 1}!`);
        } else {
            player.balance -= player.bet;
            alert(`${player.name} lost $${player.bet}.`);
        }
    });
    showGameResult();
}

/* Show the final game result */
function showGameResult() {
    render();
    restartBtn.classList.remove('hidden');
}

/* Draw a card from the deck */
function drawCard() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    return { suit, value };
}

/* Calculate the score of a hand */
function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    hand.forEach(card => {
        if (['J', 'Q', 'K'].includes(card.value)) {
            score += 10;
        } else if (card.value === 'A') {
            aces++;
            score += 11;
        } else {
            score += parseInt(card.value);
        }
    });
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}

/* Render a player's or dealer's hand */
function renderHand(hand) {
    return hand.map(card => `<div class="card ${card.suit}.${card.value}"></div>`).join('');
}

/* Start the game */
initialize();
