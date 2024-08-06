document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const setupPage = document.getElementById('setup-page');
    const landingPage = document.getElementById('landing-page');
    const nextButton = document.getElementById('next-button');
    const numPlayersInput = document.getElementById('num-players');
    const playerNamesDiv = document.getElementById('player-names');
    const playerNamesInputsDiv = document.getElementById('player-names-inputs');
    const startGameButton = document.getElementById('start-game-button');
    const gameArea = document.getElementById('game-area');
    const dealerCardsDiv = document.getElementById('dealer-cards');
    const playersArea = document.getElementById('players-area');
    const placeBetButton = document.getElementById('place-bet');
    const betAmountInput = document.getElementById('bet-amount');
    const playerControlsDiv = document.getElementById('player-controls');
    const hitButton = document.getElementById('hit-button');
    const standButton = document.getElementById('stand-button');
    const resetButton = document.getElementById('reset-button');

    let numPlayers;
    let playerNames = [];
    let playerBalances = [];
    let playerBets = [];
    let playerCards = [];
    let dealerCards = [];
    let currentPlayer = 0;

    startButton.addEventListener('click', () => {
        landingPage.style.display = 'none';
        setupPage.style.display = 'flex';
    });

    nextButton.addEventListener('click', () => {
        numPlayers = parseInt(numPlayersInput.value);
        if (numPlayers > 0 && numPlayers <= 8) {
            playerNamesDiv.style.display = 'block';
            playerNamesInputsDiv.innerHTML = '';
            for (let i = 0; i < numPlayers; i++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Player ${i + 1} Name`;
                input.id = `player-${i + 1}-name`;
                playerNamesInputsDiv.appendChild(input);
            }
        } else {
            alert('Please enter a number between 1 and 8.');
        }
    });

    startGameButton.addEventListener('click', () => {
        playerNames = [];
        for (let i = 0; i < numPlayers; i++) {
            const name = document.getElementById(`player-${i + 1}-name`).value;
            if (name.trim() === '') {
                alert('Please enter all player names.');
                return;
            }
            playerNames.push(name);
            playerBalances.push(1000); // Initial balance
            playerBets.push(0);
            playerCards.push([]);
        }
        setupPage.style.display = 'none';
        gameArea.style.display = 'flex';
        updateGameDisplay();
    });

    placeBetButton.addEventListener('click', () => {
        const betAmount = parseInt(betAmountInput.value);
        if (betAmount > 0 && betAmount <= 20000 && betAmount <= playerBalances[currentPlayer]) {
            playerBets[currentPlayer] = betAmount;
            playerBalances[currentPlayer] -= betAmount;
            currentPlayer++;
            if (currentPlayer >= numPlayers) {
                currentPlayer = 0;
                startGame();
            } else {
                updateGameDisplay();
            }
        } else {
            alert('Invalid bet amount.');
        }
    });

    function startGame() {
        dealerCards = [];
        playerCards = playerCards.map(() => []);
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < numPlayers; j++) {
                playerCards[j].push(drawCard());
            }
            dealerCards.push(drawCard());
        }
        dealerCards[1].hidden = true; // Hide dealer's second card
        playerControlsDiv.style.display = 'block';
        updateGameDisplay();
    }

    hitButton.addEventListener('click', () => {
        playerCards[currentPlayer].push(drawCard());
        if (calculatePoints(playerCards[currentPlayer]) > 21) {
            alert(`${playerNames[currentPlayer]} busted!`);
            currentPlayer++;
        }
        if (currentPlayer >= numPlayers) {
            currentPlayer = 0;
            dealerTurn();
        } else {
            updateGameDisplay();
        }
    });

    standButton.addEventListener('click', () => {
        currentPlayer++;
        if (currentPlayer >= numPlayers) {
            currentPlayer = 0;
            dealerTurn();
        } else {
            updateGameDisplay();
        }
    });

    resetButton.addEventListener('click', () => {
        location
