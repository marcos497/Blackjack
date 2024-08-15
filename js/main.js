document.addEventListener('DOMContentLoaded', () => {
    // Variables for game elements and data storage
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
    const validationMessageDiv = document.getElementById('validation-message'); // Add this line

    let players = [];
    let dealer = { name: 'Dealer', balance: 20000, cards: [] }; // Dealer starts with $20,000
    let deckId = '';
    let gameOver = false;

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

    // Update the UI to display cards for players and the dealer
    function updateUI() {
        gameTableDiv.innerHTML = ''; // Clear the game table for updates
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-info';
            playerDiv.innerHTML = `
                <h3>${player.name}</h3>
                <div class="player-hand">${player.cards.map(card => `<div class="card ${card.suit.toLowerCase()} ${card.value.toLowerCase()}"></div>`).join('')}</div>
                <div>Balance: ${player.balance}</div>
                <div>Bet: ${player.bet}</div>
            `;
            gameTableDiv.appendChild(playerDiv);
        });

        // Update the dealer's UI with one face-down card
        const dealerDiv = document.createElement('div');
        dealerDiv.id = 'dealer-info';
        dealerDiv.innerHTML = `
            <h3>Dealer</h3>
            <div id="dealer-cards" class="player-hand">
                <div class="card back"></div> <!-- Face-down card -->
                ${dealer.cards.slice(1).map(card => `<div class="card ${card.suit.toLowerCase()} ${card.value.toLowerCase()}"></div>`).join('')}
            </div>
        `;
        gameTableDiv.appendChild(dealerDiv);

        gameLogDiv.innerHTML = ''; // Clear the game log for new updates
    }

    // Reveal the dealer's face-down card when it's the dealer's turn
    function revealDealerCard() {
        const dealerFirstCard = dealer.cards[0];
        const faceDownCard = document.querySelector('#dealer-cards .card.back');
        
        if (faceDownCard) {
            faceDownCard.className = `card ${dealerFirstCard.suit.toLowerCase()} ${dealerFirstCard.value.toLowerCase()}`;
        } else {
            displayValidationMessage('Error drawing cards: Face-down card element not found.'); // Use the validation function
        }
    }

    // Submit player names and start the betting phase
    submitPlayersButton.addEventListener('click', () => {
        const numPlayers = parseInt(numPlayersInput.value);
        if (isNaN(numPlayers) || numPlayers < 1 || numPlayers > 2) { // Limit to 1 or 2 players
            displayValidationMessage('Please enter a number between 1 and 2.'); // Use the validation function
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
                    displayValidationMessage(`Please enter a name for Player ${i}.`); // Use the validation function
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
    bettingTableDiv.addEventListener('input', () => {
        validateBets(); // Validate bets on input change
    });

    // Submit bets and start the game
    submitBetsButton.addEventListener('click', () => {
        let validBets = true;
        players.forEach((player, index) => {
            const betAmount = parseInt(document.getElementById(`bet-${index}`).value);
            if (isNaN(betAmount) || betAmount <= 0 || betAmount > player.balance) {
                displayValidationMessage(`Invalid bet amount for ${player.name}. Please enter a valid bet.`); // Use the validation function
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
                drawInitialCards(); // Draw the initial cards
            })
            .catch(error => {
                displayValidationMessage(`Error starting the game: ${error.message}`); // Use the validation function
            });
    }

    // Draw the initial cards for all players and the dealer
    function drawInitialCards() {
        const drawPromises = []; // Array to hold the promises for drawing cards

        players.forEach(player => {
            drawPromises.push(drawCardForPlayer(player)); // Push each player's draw promise into the array
        });

        drawPromises.push(drawCardForDealer()); // Push the dealer's draw promise into the array

        // Wait for all card draws to complete
        Promise.all(drawPromises)
            .then(() => {
                // Update the UI with the drawn cards
                updateUI();
                revealDealerCard(); // Reveal the dealer's face-down card
            })
            .catch(error => {
                displayValidationMessage(`Error drawing cards: ${error.message}`); // Use the validation function
            });
    }

    // Draw a card for a specific player
    function drawCardForPlayer(player) {
        return fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
            .then(response => response.json())
            .then(data => {
                player.cards = data.cards;
            })
            .catch(error => {
                displayValidationMessage(`Error drawing cards for ${player.name}: ${error.message}`); // Use the validation function
            });
    }

    // Draw a card for the dealer
    function drawCardForDealer() {
        return fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
            .then(response => response.json())
            .then(data => {
                dealer.cards = data.cards;
            })
            .catch(error => {
                displayValidationMessage(`Error drawing cards for the dealer: ${error.message}`); // Use the validation function
            });
    }

    // Handle the end of the game, check for win/loss conditions, etc.
    function endGame() {
        // Implement game-ending logic and display the results
    }
});



// Key Changes
// Validation Message Function: Added a function displayValidationMessage to show error messages in the validationMessageDiv.
// Validation Messages: Incorporated validation messages for various actions such as starting the game, betting, and drawing cards. This ensures that users receive feedback when they make mistakes.
// Make sure to add the validationMessageDiv element in your HTML to display these messages. This will enhance the user experience by providing clear feedback on errors and validation issues.