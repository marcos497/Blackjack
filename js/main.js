document.addEventListener('DOMContentLoaded', () => {
    // Variables for game elements and data storage
    const startButton = document.getElementById('start-button');
    const introPage = document.getElementById('intro-page');
    const submitPlayersButton = document.getElementById('submit-players');
    const bettingPage = document.getElementById('betting-page');
    const gamePage = document.getElementById('game-page');
    const actionButtonsDiv = document.getElementById('action-buttons');
    const hitButton = document.createElement('button');
    const standButton = document.createElement('button');
    const restartButton = document.getElementById('restart-button');
    const numPlayersInput = document.getElementById('num-players');
    const playerNamesDiv = document.getElementById('player-names');
    const bettingTableDiv = document.getElementById('betting-table');
    const submitBetsButton = document.getElementById('submit-bets');
    const gameTableDiv = document.getElementById('game-table');
    const gameLogDiv = document.getElementById('game-log');
    const validationMessageDiv = document.getElementById('validation-message');

    let players = [];
    let dealer = { name: 'Dealer', balance: 20000, cards: [] }; // Dealer starts with $20,000
    let deckId = '';
    let gameOver = false;
    let currentPlayerIndex = 0;

    // Function to display validation messages
    function displayValidationMessage(message) {
        validationMessageDiv.innerHTML = message;
    }

    // Start button functionality to display the introduction page
    startButton.addEventListener('click', () => {
        document.getElementById('landing-page').style.display = 'none';
        introPage.style.display = 'block';
        validationMessageDiv.innerHTML = ''; // Clear validation messages
    });

    // Submit player names and start the betting phase
    submitPlayersButton.addEventListener('click', () => {
        const numPlayers = parseInt(numPlayersInput.value);
        if (isNaN(numPlayers) || numPlayers < 1 || numPlayers > 2) { // Limit to 1 or 2 players
            displayValidationMessage('Please enter a number between 1 and 2.');
            return;
        }

        // Clear previous player name inputs and buttons
        playerNamesDiv.innerHTML = '';

        for (let i = 1; i <= numPlayers; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `player-${i}`;
            input.placeholder = `Player ${i} Name`;
            playerNamesDiv.appendChild(input);
            playerNamesDiv.appendChild(document.createElement('br'));
        }

        const submitNamesButton = document.createElement('button');
        submitNamesButton.textContent = 'Submit Names';
        submitNamesButton.addEventListener('click', () => {
            players = [];
            let allNamesEntered = true;
            for (let i = 1; i <= numPlayers; i++) {
                const name = document.getElementById(`player-${i}`).value.trim();
                if (name) {
                    players.push({
                        name,
                        balance: 25000,
                        bet: 0,
                        cards: [],
                        hasStood: false,
                        hasBusted: false
                    });
                } else {
                    allNamesEntered = false;
                    displayValidationMessage(`Please enter a name for Player ${i}.`);
                    break;
                }
            }
            if (allNamesEntered) {
                introPage.style.display = 'none';
                bettingPage.style.display = 'block';
                showBettingTable();
            }
        });

        playerNamesDiv.appendChild(submitNamesButton);
    });

    // Display the betting table for each player
    function showBettingTable() {
        bettingTableDiv.innerHTML = '';
        players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-bet';
            playerDiv.innerHTML = `
                <h3>${player.name}</h3>
                <input type="number" id="bet-${index}" placeholder="Bet Amount" min="1" max="${player.balance}">
                <span>Balance: ${player.balance}</span>
            `;
            bettingTableDiv.appendChild(playerDiv);
        });

        // Disable the submit bets button initially
        submitBetsButton.disabled = true;
    }

    // Validate and enable betting inputs
    function validateBets() {
        let validBets = true;
        players.forEach((player, index) => {
            const betAmount = parseInt(document.getElementById(`bet-${index}`).value);
            if (isNaN(betAmount) || betAmount <= 0 || betAmount > player.balance) {
                validBets = false;
            }
        });

        // Enable or disable the submit button based on validity
        submitBetsButton.disabled = !validBets;
    }

    // Handle input events for bet validation
    bettingTableDiv.addEventListener('input', validateBets);

    // Submit bets and start the game
    submitBetsButton.addEventListener('click', () => {
        let validBets = true;
        players.forEach((player, index) => {
            const betAmount = parseInt(document.getElementById(`bet-${index}`).value);
            if (isNaN(betAmount) || betAmount <= 0 || betAmount > player.balance) {
                displayValidationMessage(`Invalid bet amount for ${player.name}. Please enter a valid bet.`);
                validBets = false;
            } else {
                player.bet = betAmount;
                player.balance -= betAmount;
            }
        });

        if (!validBets) return;

        bettingPage.style.display = 'none';
        gamePage.style.display = 'block';
        startGame();
    });

    // Start the game by fetching a new deck from the API
    function startGame() {
        fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
            .then(response => response.json())
            .then(data => {
                deckId = data.deck_id; // Store the deck ID for future API calls
                drawInitialCards();
            })
            .catch(error => {
                displayValidationMessage(`Error fetching deck: ${error.message}`);
            });
    }

    // Draw initial cards for players and dealer
    function drawInitialCards() {
        players.forEach(player => {
            drawCardForPlayer(player);
            drawCardForPlayer(player);
        });
        drawCardForDealer(true); // Dealer's first card face-down
        drawCardForDealer(false); // Dealer's second card face-up
    }

    // Function to draw cards for a player
    function drawCardForPlayer(player, isHit = false) {
        fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
            .then(response => response.json())
            .then(data => {
                player.cards.push(data.cards[0]);
                if (isHit) {
                    updateUI(); // Update the UI after each hit
                    if (calculateHandValue(player.cards) > 21) {
                        player.hasBusted = true;
                        displayValidationMessage(`${player.name} has busted!`);
                        currentPlayerIndex++;
                        if (currentPlayerIndex >= players.length) {
                            dealerTurn();
                        }
                    }
                }
            })
            .catch(error => {
                displayValidationMessage(`Error drawing cards for ${player.name}: ${error.message}`);
            });
    }

    // Function to draw cards for the dealer
    function drawCardForDealer(faceDown = false) {
        fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
            .then(response => response.json())
            .then(data => {
                dealer.cards.push(data.cards[0]);
                updateUI();
            })
            .catch(error => {
                displayValidationMessage(`Error drawing cards for the dealer: ${error.message}`);
            });
    }

    // Function to reveal the dealer's hidden card
    function revealDealerCard() {
        dealer.cards[0].image = ''; // Change this to fetch the actual card image
        updateUI();
    }

    // Function to update the game UI based on current game state
    function updateUI() {
        gameTableDiv.innerHTML = '';
        players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-hand';
            playerDiv.innerHTML = `
                <h3>${player.name}</h3>
                <div class="cards">
                    ${player.cards.map(card => `<img src="${card.image}" alt="${card.code}" class="card">`).join('')}
                </div>
                <p>Hand Value: ${calculateHandValue(player.cards)}</p>
                <p>Balance: ${player.balance}</p>
            `;

            // Add Hit and Stand buttons for each player
            const playerActions = document.createElement('div');
            playerActions.className = 'player-actions';
            
            hitButton.textContent = 'Hit';
            hitButton.id = 'hit-button';
            hitButton.className = 'action-button';
            hitButton.addEventListener('click', () => {
                if (!gameOver && !player.hasBusted && !player.hasStood) {
                    drawCardForPlayer(player, true);
                }
            });

            standButton.textContent = 'Stand';
            standButton.id = 'stand-button';
            standButton.className = 'action-button';
            standButton.addEventListener('click', () => {
                if (!gameOver && !player.hasBusted && !player.hasStood) {
                    player.hasStood = true;
                    currentPlayerIndex++;
                    if (currentPlayerIndex >= players.length) {
                        dealerTurn();
                    }
                    updateActionButtons();
                }
            });

            playerActions.appendChild(hitButton);
            playerActions.appendChild(standButton);
            playerDiv.appendChild(playerActions);

            gameTableDiv.appendChild(playerDiv);
        });

        // Update dealer's hand
        const dealerDiv = document.createElement('div');
        dealerDiv.className = 'dealer-hand';
        dealerDiv.innerHTML = `
            <h3>${dealer.name}</h3>
            <div class="cards">
                ${dealer.cards.map(card => `<img src="${card.image}" alt="${card.code}" class="card">`).join('')}
            </div>
            <p>Hand Value: ${calculateHandValue(dealer.cards)}</p>
        `;
        gameTableDiv.appendChild(dealerDiv);

        updateActionButtons();
    }

    // Function to calculate the total value of a hand
    function calculateHandValue(cards) {
        let value = 0;
        let aceCount = 0;
        cards.forEach(card => {
            if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
                value += 10;
            } else if (card.value === 'ACE') {
                aceCount++;
                value += 11;
            } else {
                value += parseInt(card.value);
            }
        });

        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }

        return value;
    }

    // Function to update the visibility and functionality of action buttons
    function updateActionButtons() {
        if (players.length > 0) {
            const currentPlayer = players[currentPlayerIndex];
            if (currentPlayer.hasBusted || currentPlayer.hasStood) {
                hitButton.disabled = true;
                standButton.disabled = true;
            } else {
                hitButton.disabled = false;
                standButton.disabled = false;
            }
        } else {
            hitButton.disabled = true;
            standButton.disabled = true;
        }

        if (gameOver) {
            hitButton.disabled = true;
            standButton.disabled = true;
            restartButton.disabled = false;
        }
    }

    // Handle player actions (hit and stand)
    hitButton.addEventListener('click', () => {
        if (!gameOver) {
            const currentPlayer = players[currentPlayerIndex];
            drawCardForPlayer(currentPlayer, true);
        }
    });

    standButton.addEventListener('click', () => {
        if (!gameOver) {
            const currentPlayer = players[currentPlayerIndex];
            currentPlayer.hasStood = true;
            currentPlayerIndex++;
            if (currentPlayerIndex >= players.length) {
                dealerTurn();
            }
            updateActionButtons();
        }
    });

    // Function to handle the dealer's turn
    function dealerTurn() {
        revealDealerCard();
        while (calculateHandValue(dealer.cards) < 17) {
            drawCardForDealer();
        }
        evaluateGameResults();
        gameOver = true;
        updateUI();
    }

    // Function to evaluate game results and determine winners
    function evaluateGameResults() {
        const dealerValue = calculateHandValue(dealer.cards);
        players.forEach(player => {
            if (player.hasBusted) {
                gameLogDiv.innerHTML += `<p>${player.name} lost their bet.</p>`;
            } else if (dealerValue > 21 || calculateHandValue(player.cards) > dealerValue) {
                gameLogDiv.innerHTML += `<p>${player.name} won their bet!</p>`;
                player.balance += player.bet * 2; // Win double the bet amount
            } else if (calculateHandValue(player.cards) < dealerValue) {
                gameLogDiv.innerHTML += `<p>${player.name} lost their bet.</p>`;
            } else {
                gameLogDiv.innerHTML += `<p>${player.name} tied with the dealer.</p>`;
                player.balance += player.bet; // Return the bet amount
            }
        });
    }

    // Restart the game
    restartButton.addEventListener('click', () => {
        window.location.reload();
    });

    // Update action buttons visibility and functionality on page load
    updateActionButtons();
});
