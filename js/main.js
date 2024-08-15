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
    const dealerCardsDiv = document.getElementById('dealer-cards');
    const gameLogDiv = document.getElementById('game-log');
    const validationMessageDiv = document.getElementById('validation-message');

    let players = [];
    let dealer = { name: 'Dealer', balance: 20000, cards: [], hasStood: false, hasBusted: false }; // Dealer starts with $20,000
    let deckId = '';
    let gameOver = false;
    let currentPlayerIndex = 0;
    let showValidationMessages = true; // Flag to control validation message display

    // Define card images
    const cardImages = {
        'AS': 'path/to/images/AS.svg',
        '2S': 'path/to/images/2S.svg',
        // Add all card images
        'KH': 'path/to/images/KH.svg',
        'QD': 'path/to/images/QD.svg',
        // Continue for all cards...
    };

    // Function to display validation messages
    function displayValidationMessage(message) {
        if (showValidationMessages) {
            validationMessageDiv.innerHTML = message;
        }
    }

    // Function to check if the game should end and offer restart
    function checkGameEnd() {
        const dealerValue = calculateHandValue(dealer.cards);
        const playerHasBlackjack = players.some(player => calculateHandValue(player.cards) === 21);
        if (playerHasBlackjack || dealerValue === 21) {
            displayValidationMessage('A player or dealer has 21! Would you like to restart the game?');
            restartButton.style.display = 'block';
            actionButtonsDiv.style.display = 'none';
        } else if (players.every(player => player.hasStood || player.hasBusted)) {
            dealerTurn();
        }
    }

    // Start button functionality to display the introduction page
    startButton.addEventListener('click', () => {
        document.getElementById('landing-page').style.display = 'none';
        introPage.style.display = 'block';
        validationMessageDiv.innerHTML = ''; // Clear validation messages
        showValidationMessages = true; // Enable validation messages
    });

    // Submit player names and start the betting phase
    submitPlayersButton.addEventListener('click', () => {
        const numPlayers = parseInt(numPlayersInput.value);
        if (isNaN(numPlayers) || numPlayers < 1 || numPlayers > 3) { // Limit to 1 to 3 players
            displayValidationMessage('Please enter a number between 1 and 3.');
            return;
        }

        // Clear previous player name inputs and buttons
        playerNamesDiv.innerHTML = '';

        for (let i = 1; i <= numPlayers; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `player-${i}`;
            input.placeholder = `Player ${i} Name`;
            input.addEventListener('input', () => {
                validationMessageDiv.innerHTML = ''; // Clear message when user inputs valid name
            });
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
            const div = document.createElement('div');
            div.innerHTML = `<label>${player.name}: </label>`;
            const betInput = document.createElement('input');
            betInput.type = 'number';
            betInput.min = '0';
            betInput.placeholder = 'Bet amount';
            betInput.id = `bet-${index}`;
            div.appendChild(betInput);
            bettingTableDiv.appendChild(div);
        });
        submitBetsButton.disabled = false;
    }

    // Submit bets and start the game
    submitBetsButton.addEventListener('click', () => {
        let allBetsPlaced = true;
        players.forEach((player, index) => {
            const betInput = document.getElementById(`bet-${index}`);
            const bet = parseInt(betInput.value);
            if (isNaN(bet) || bet <= 0 || bet > player.balance) {
                allBetsPlaced = false;
                displayValidationMessage(`Invalid bet for ${player.name}. Please enter a valid amount.`);
                return;
            }
            player.bet = bet;
            player.balance -= bet;
        });

        if (allBetsPlaced) {
            startGame();
        }
    });

    // Start the game by shuffling the deck and dealing cards
    async function startGame() {
        try {
            const deckResponse = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
            const deckData = await deckResponse.json();
            deckId = deckData.deck_id;

            await Promise.all(players.map(player => dealCard(player)));
            await dealCard(dealer);
            await dealCard(dealer);

            updateGameDisplay();
            bettingPage.style.display = 'none';
            gamePage.style.display = 'block';
            actionButtonsDiv.style.display = 'block';
        } catch (error) {
            console.error('Error starting game:', error);
            displayValidationMessage('Error starting game. Please try again.');
        }
    }

    // Deal a card to a given participant
    async function dealCard(participant) {
        try {
            const cardResponse = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
            const cardData = await cardResponse.json();
            const card = cardData.cards[0];
            participant.cards.push(card);
            if (participant === dealer && dealer.cards.length === 2) {
                dealer.cards[1].isFaceDown = true; // Dealer's second card is face-down initially
            }
            updateGameDisplay();
        } catch (error) {
            console.error('Error dealing card:', error);
            displayValidationMessage('Error dealing card. Please try again.');
        }
    }

    // Calculate the value of a hand
    function calculateHandValue(cards) {
        let value = 0;
        let hasAce = false;
        cards.forEach(card => {
            if (card.value === 'ACE') {
                hasAce = true;
                value += 1;
            } else if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value);
            }
        });
        if (hasAce && value + 10 <= 21) {
            value += 10; // Consider ACE as 11 if it doesn't bust the hand
        }
        return value;
    }

    // Update the game display with current card and player information
    function updateGameDisplay() {
        gameTableDiv.innerHTML = '';
        dealerCardsDiv.innerHTML = 'Dealer\'s Cards:<br>';
        dealer.cards.forEach((card, index) => {
            dealerCardsDiv.innerHTML += `<img src="${cardImages[card.code]}" alt="${card.value} of ${card.suit}">`;
        });

        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-hand';
            playerDiv.innerHTML = `<h3>${player.name}</h3>`;
            player.cards.forEach(card => {
                playerDiv.innerHTML += `<img src="${cardImages[card.code]}" alt="${card.value} of ${card.suit}">`;
            });
            gameTableDiv.appendChild(playerDiv);
        });

        // Check for win/loss conditions after dealing
        checkGameEnd();
    }

    // Dealer's turn logic
    function dealerTurn() {
        actionButtonsDiv.style.display = 'none';
        let dealerValue = calculateHandValue(dealer.cards);
        while (dealerValue < 17) {
            dealCard(dealer).then(() => {
                dealerValue = calculateHandValue(dealer.cards);
                updateGameDisplay();
            });
        }
        determineWinners();
    }

    // Determine game outcomes and notify players
    function determineWinners() {
        const dealerValue = calculateHandValue(dealer.cards);
        players.forEach(player => {
            const playerValue = calculateHandValue(player.cards);
            if (player.hasBusted) {
                gameLogDiv.innerHTML += `<p>${player.name} busted and lost their bet.</p>`;
            } else if (dealer.hasBusted || playerValue > dealerValue) {
                player.balance += player.bet * 2; // Win double the bet
                gameLogDiv.innerHTML += `<p>${player.name} wins!</p>`;
            } else if (playerValue === dealerValue) {
                player.balance += player.bet; // Push, return bet
                gameLogDiv.innerHTML += `<p>${player.name} pushes.</p>`;
            } else {
                gameLogDiv.innerHTML += `<p>${player.name} loses their bet.</p>`;
            }
        });
        showRestartButton();
    }

    // Display the restart button
    function showRestartButton() {
        restartButton.style.display = 'block';
    }

    // Event listeners for Hit and Stand actions
    hitButton.textContent = 'Hit';
    hitButton.addEventListener('click', () => {
        if (!gameOver && !players[currentPlayerIndex].hasBusted) {
            dealCard(players[currentPlayerIndex]).then(() => {
                const playerValue = calculateHandValue(players[currentPlayerIndex].cards);
                if (playerValue > 21) {
                    players[currentPlayerIndex].hasBusted = true;
                    displayValidationMessage(`${players[currentPlayerIndex].name} busted!`);
                }
                updateGameDisplay();
                checkGameEnd();
            });
        }
    });
    standButton.textContent = 'Stand';
    standButton.addEventListener('click', () => {
        if (!gameOver && !players[currentPlayerIndex].hasBusted) {
            players[currentPlayerIndex].hasStood = true;
            currentPlayerIndex++;
            if (currentPlayerIndex >= players.length) {
                dealerTurn();
            } else {
                updateGameDisplay();
            }
        }
    });

    // Restart the game
    restartButton.addEventListener('click', () => {
        window.location.reload();
    });

    // Initialize the hit and stand buttons in the action buttons div
    actionButtonsDiv.appendChild(hitButton);
    actionButtonsDiv.appendChild(standButton);
    actionButtonsDiv.style.display = 'none';

});
