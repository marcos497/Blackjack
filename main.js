/*----- functions -----*/
document.addEventListener('DOMContentLoaded', () => {
    initialize();
    render();
});

function initialize() {
    // Get references to various DOM elements for manipulation
    const startButton = document.getElementById('start-button');
    const introPage = document.getElementById('intro-page');
    const submitPlayersButton = document.getElementById('submit-players');
    const bettingPage = document.getElementById('betting-page');
    const gamePage = document.getElementById('game-page');
    const numPlayersInput = document.getElementById('num-players');
    const playerNamesDiv = document.getElementById('player-names');
    const bettingTableDiv = document.getElementById('betting-table');
    const submitBetsButton = document.getElementById('submit-bets');
    const gameTableDiv = document.getElementById('game-table');
    const gameLogDiv = document.getElementById('game-log');

    // Initialize players array and dealer object
    let players = [];
    let dealer = { name: 'Dealer', balance: 20000, cards: [] }; // Dealer starts with $20,000
    let gameOver = false;

    // Event listener for the start button
    startButton.addEventListener('click', () => {
        document.getElementById('landing-page').style.display = 'none';
        introPage.style.display = 'block';
    });

    // Event listener for the submit players button
    submitPlayersButton.addEventListener('click', () => {
        const numPlayers = parseInt(numPlayersInput.value);
        if (numPlayers < 1 || numPlayers > 8) {
            alert('Please enter a number between 1 and 8.');
            return;
        }

        players = [];
        playerNamesDiv.innerHTML = '';

        // Create input fields for each player's name
        for (let i = 1; i <= numPlayers; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `player-${i}`;
            input.placeholder = `Player ${i} Name`;
            playerNamesDiv.appendChild(input);
            playerNamesDiv.appendChild(document.createElement('br'));
        }

        // Create and append a submit names button
        const submitNamesButton = document.createElement('button');
        submitNamesButton.textContent = 'Submit Names';
        submitNamesButton.addEventListener('click', () => {
            players = [];
            for (let i = 1; i <= numPlayers; i++) {
                const name = document.getElementById(`player-${i}`).value;
                if (name) {
                    players.push({ name, balance: 1000, bet: 0, cards: [], hasStood: false });
                }
            }
            introPage.style.display = 'none';
            bettingPage.style.display = 'block';
            renderBettingTable();
        });

        playerNamesDiv.appendChild(submitNamesButton);
    });

    // Function to render the betting table
    function renderBettingTable() {
        bettingTableDiv.innerHTML = '';
        players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-bet';
            playerDiv.innerHTML = `
                <p>${player.name} - Balance: $${player.balance}</p>
                <input type="number" id="bet-${index}" placeholder="Enter bet amount" min="1" max="10000">
            `;
            bettingTableDiv.appendChild(playerDiv);
        });
    }

    // Event listener for the submit bets button
    submitBetsButton.addEventListener('click', () => {
        let validBets = true;
        players.forEach((player, index) => {
            const betAmount = parseInt(document.getElementById(`bet-${index}`).value);
            if (isNaN(betAmount) || betAmount <= 0 || betAmount > player.balance) {
                alert(`Invalid bet amount for ${player.name}.`);
                validBets = false;
                return;
            }
            player.bet = betAmount;
        });

        if (validBets) {
            bettingPage.style.display = 'none';
            gamePage.style.display = 'block';
            renderGameTable();
            startGame();
        }
    });

    // Function to render the game table
    function renderGameTable() {
        gameTableDiv.innerHTML = '';
        const dealerDiv = document.createElement('div');
        dealerDiv.id = 'dealer-info';
        dealerDiv.className = 'player-info';
        dealerDiv.innerHTML = `
            <h3>${dealer.name}</h3>
            <p>Balance: $${dealer.balance}</p>
            <p>Cards: <span id="dealer-cards"></span></p>
        `;
        gameTableDiv.appendChild(dealerDiv);

        players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-info';
            playerDiv.id = `player-info-${index}`;
            playerDiv.innerHTML = `
                <h3>${player.name}</h3>
                <p>Balance: $${player.balance}</p>
                <p>Bet: $${player.bet}</p>
                <p>Cards: <span id="player-cards-${index}"></span></p>
                <p id="player-status-${index}"></p>
                <div class="player-controls">
                    <button class="hit" data-index="${index}">Hit</button>
                    <button class="stay" data-index="${index}">Stay</button>
                </div>
                <p id="player-result-${index}"></p>
            `;
            gameTableDiv.appendChild(playerDiv);
        });

        // Show game controls
        gameTableDiv.innerHTML += `
            <div id="game-controls">
                <!-- No End Turn button -->
            </div>
        `;

        // Add event listeners for the hit and stay buttons
        document.querySelectorAll('.hit').forEach(button => {
            button.addEventListener('click', handleHit);
        });
        document.querySelectorAll('.stay').forEach(button => {
            button.addEventListener('click', handleStay);
        });
    }

    // Function to handle the hit action
    function handleHit(event) {
        if (gameOver) return;

        const index = parseInt(event.target.getAttribute('data-index'));
        const player = players[index];

        if (player.hasStood) {
            alert(`${player.name} has already stood.`);
            return;
        }

        const card = drawCard();
        player.cards.push(card);
        render();
    }

    // Function to handle the stay action
    function handleStay(event) {
        const index = parseInt(event.target.getAttribute('data-index'));
        players[index].hasStood = true;
        render();
    }

    // Function to start the game
    function startGame() {
        // Deal initial two cards to each player and dealer
        players.forEach(player => {
            player.cards = [drawCard(), drawCard()];
        });
        dealer.cards = [drawCard(), drawCard()];

        render();
    }

    // Function to draw a card (placeholder, should be implemented)
    function drawCard() {
        // Placeholder function, you can implement actual card drawing logic
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return `${value} of ${suit}`;
    }

    // Function to render the game state
    function render() {
        // Render dealer's cards
        document.getElementById('dealer-cards').textContent = dealer.cards.join(', ');

        // Render each player's cards and status
        players.forEach((player, index) => {
            document.getElementById(`player-cards-${index}`).textContent = player.cards.join(', ');
            const statusElement = document.getElementById(`player-status-${index}`);
            if (player.hasStood) {
                statusElement.textContent = 'Stood';
            } else {
                statusElement.textContent = '';
            }
        });

        // Check if all players have stood to end the game
        if (players.every(player => player.hasStood)) {
            gameOver = true;
            endGame();
        }
    }

    // Function to end the game (placeholder, should be implemented)
    function endGame() {
        // Placeholder function, you can implement actual game-ending logic
        alert('Game Over!');
    }
});
