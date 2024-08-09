document.addEventListener('DOMContentLoaded', () => {
    // DOM elements from the first snippet
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

    // DOM elements from the second snippet
    const numberOfPlayersInput = document.getElementById('numberOfPlayersInput');
    const submitNumberOfPlayersButton = document.getElementById('submitNumberOfPlayers');
    const playerNamesSection = document.getElementById('playerNamesSection');
    const playerInputsContainer = document.getElementById('playerInputsContainer');
    const submitPlayerNamesButton = document.getElementById('submitPlayerNames');
    const activePlayersSection = document.getElementById('activePlayers');
    const playersList = document.getElementById('playersList');

    // Game variables
    let players = [];
    let dealer = { name: 'Dealer', balance: 20000, cards: [] }; // Dealer starts with $20,000
    let gameOver = false;
    let numberOfPlayers = 0;
    let playerNames = [];

    // Start button functionality
    startButton.addEventListener('click', () => {
        document.getElementById('landing-page').style.display = 'none';
        introPage.style.display = 'block';
    });

    // Handle the number of players submission
    submitNumberOfPlayersButton.addEventListener('click', () => {
        numberOfPlayers = parseInt(numberOfPlayersInput.value, 10);
        if (isNaN(numberOfPlayers) || numberOfPlayers < 1 || numberOfPlayers > 8) {
            alert('Please enter a number between 1 and 8.');
            return;
        }

        // Hide number of players section and show player names section
        document.getElementById('numberOfPlayersSection').style.display = 'none';
        playerNamesSection.style.display = 'block';

        // Generate input fields for player names
        playerInputsContainer.innerHTML = '';
        for (let i = 0; i < numberOfPlayers; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Player ${i + 1} name`;
            input.id = `playerName${i + 1}`;
            playerInputsContainer.appendChild(input);
        }
    });

    // Handle the player names submission
    submitPlayerNamesButton.addEventListener('click', () => {
        playerNames = [];
        for (let i = 0; i < numberOfPlayers; i++) {
            const nameInput = document.getElementById(`playerName${i + 1}`);
            const name = nameInput.value.trim();
            if (name) {
                playerNames.push({ name, balance: 1000, bet: 0, cards: [], hasStood: false });
            } else {
                alert('Please enter a name for all players.');
                return;
            }
        }

        // Display the list of active players
        playerNamesSection.style.display = 'none';
        activePlayersSection.style.display = 'block';

        playersList.innerHTML = '';
        playerNames.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = player.name;
            playersList.appendChild(playerDiv);
        });

        // Proceed to betting phase
        bettingPage.style.display = 'block';
        showBettingTable();
    });

    // Show betting table functionality
    function showBettingTable() {
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

    // Submit bets functionality
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
            showGameTable();
            startGame();
        }
    });

    // Show game table functionality
    function showGameTable() {
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
                <p id="player-status-${index}"></p> <!-- Status paragraph -->
                <div class="player-controls">
                    <button class="hit" data-index="${index}">Hit</button>
                    <button class="stay" data-index="${index}">Stay</button>
                </div>
                <p id="player-result-${index}"></p> <!-- Result paragraph -->
            `;
            gameTableDiv.appendChild(playerDiv);
        });

        // Show game controls
        gameTableDiv.innerHTML += `
            <div id="game-controls">
                <!-- No End Turn button -->
            </div>
        `;

        // Add event listeners for buttons
        document.querySelectorAll('.hit').forEach(button => {
            button.addEventListener('click', handleHit);
        });
        document.querySelectorAll('.stay').forEach(button => {
            button.addEventListener('click', handleStay);
        });
    }

    // Hit button functionality
    function handleHit(event) {
        if (gameOver) return;

        const index = parseInt(event.target.getAttribute('data-index'));
        const player = players[index];

        if (player.hasStood) {
            alert(`${player.name} has already stayed.`);
            return;
        }

        const card = drawCard();
        player.cards.push(card);
        document.getElementById(`player-cards-${index}`).textContent = player.cards.join(', ');

        if (calculateHandValue(player.cards) > 21) {
            alert(`${player.name} has busted!`);
            dealer.balance += player.bet;  // Player's bet goes to dealer
            player.balance -= player.bet;  // Player loses their bet
            player.bet = 0;  // Reset player's bet
            player.hasStood = true;  // Player cannot hit after busting

            // Display result for player
            document.getElementById(`player-result-${index}`).textContent = `${player.name} busts!`;
            document.getElementById(`player-status-${index}`).textContent = 'Busted!';

            // Disable player controls
            document.querySelector(`.hit[data-index="${index}"]`).disabled = true;
            document.querySelector(`.stay[data-index="${index}"]`).disabled = true;

            // Re-enable buttons for remaining players
            updatePlayerControls();

            checkAllPlayersStayed();
        }
    }

    // Stay button functionality
    function handleStay(event) {
        const index = parseInt(event.target.getAttribute('data-index'));
        const player = players[index];

        if (player.hasStood) {
            alert(`${player.name} has already stayed.`);
            return;
        }

        player.hasStood = true;
        document.querySelector(`.hit[data-index="${index}"]`).disabled = true;  // Disable Hit button
        document.querySelector(`.stay[data-index="${index}"]`).disabled = true;  // Disable Stay button

        document.getElementById(`player-status-${index}`).textContent = 'Stayed!';
        updatePlayerControls();
        checkAllPlayersStayed();
    }

    // Check if all players have stayed
    function checkAllPlayersStayed() {
        if (players.every(player => player.hasStood || calculateHandValue(player.cards) > 21)) {
            dealerPlay();
        }
    }

    // Dealer's play logic
    function dealerPlay() {
        // Dealer reveals hidden card
        document.getElementById('dealer-cards').textContent = dealer.cards.join(', ');
        // Dealer plays
        while (calculateHandValue(dealer.cards) < 17) {
            dealer.cards.push(drawCard());
            document.getElementById('dealer-cards').textContent = dealer.cards.join(', ');
        }

        const dealerHandValue = calculateHandValue(dealer.cards);
        let dealerBusted = dealerHandValue > 21;
        if (dealerBusted) {
            document.getElementById('dealer-info').innerHTML += ' Dealer busts!';
            players.forEach(player => {
                if (!player.hasStood && calculateHandValue(player.cards) <= 21) {
                    player.balance += player.bet * 2;
                } else {
                    player.balance += player.bet;
                }
                player.bet = 0;
                document.getElementById(`player-result-${players.indexOf(player)}`).textContent = `${player.name} wins!`;
            });
        } else {
            // Dealer did not bust
            players.forEach(player => {
                if (!player.hasStood) {
                    const playerHandValue = calculateHandValue(player.cards);
                    if (playerHandValue > 21) {
                        dealer.balance += player.bet;
                    } else if (playerHandValue > dealerHandValue) {
                        player.balance += player.bet * 2;
                        document.getElementById(`player-result-${players.indexOf(player)}`).textContent = `${player.name} wins!`;
                    } else if (playerHandValue < dealerHandValue) {
                        dealer.balance += player.bet;
                        document.getElementById(`player-result-${players.indexOf(player)}`).textContent = `${player.name} loses.`;
                    } else {
                        player.balance += player.bet;
                        document.getElementById(`player-result-${players.indexOf(player)}`).textContent = `${player.name} ties.`;
                    }
                }
                player.bet = 0;
            });
        }

        gameOver = true;
    }

    // Draw a card from the deck (simplified example)
    function drawCard() {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return `${value} of ${suit}`;
    }

    // Calculate hand value (simplified example)
    function calculateHandValue(cards) {
        const valueMap = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 10, 'Q': 10, 'K': 10, 'A': 11
        };
        let value = 0;
        let numAces = 0;
        cards.forEach(card => {
            const cardValue = card.split(' ')[0];
            value += valueMap[cardValue];
            if (cardValue === 'A') numAces++;
        });
        while (value > 21 && numAces > 0) {
            value -= 10;
            numAces--;
        }
        return value;
    }

    // Update player controls based on game state
    function updatePlayerControls() {
        if (players.every(player => player.hasStood || calculateHandValue(player.cards) > 21)) {
            document.querySelectorAll('.hit').forEach(button => button.disabled = true);
            document.querySelectorAll('.stay').forEach(button => button.disabled = true);
        }
    }
});
