document.addEventListener('DOMContentLoaded', () => {
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

    let players = [];
    let dealer = { name: 'Dealer', balance: 20000, cards: [] }; // Dealer starts with $20,000
    let deckId = '';
    let deckPromise = null;
    let gameOver = false;

    // Start button functionality
    startButton.addEventListener('click', () => {
        document.getElementById('landing-page').style.display = 'none';
        introPage.style.display = 'block';
    });

    // Submit players functionality
    submitPlayersButton.addEventListener('click', () => {
        const numPlayers = parseInt(numPlayersInput.value);
        if (numPlayers < 1 || numPlayers > 8) {
            alert('Please enter a number between 1 and 8.');
            return;
        }

        players = [];
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
            for (let i = 1; i <= numPlayers; i++) {
                const name = document.getElementById(`player-${i}`).value;
                if (name) {
                    players.push({ name, balance: 1000, bet: 0, cards: [], hasStood: false, hasBusted: false });
                }
            }
            introPage.style.display = 'none';
            bettingPage.style.display = 'block';
            showBettingTable();
        });

        playerNamesDiv.appendChild(submitNamesButton);
    });

    // Show betting table functionality
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
    }

    // Submit bets functionality
    submitBetsButton.addEventListener('click', () => {
        let validBets = true;
        players.forEach((player, index) => {
            const betAmount = parseInt(document.getElementById(`bet-${index}`).value);
            if (isNaN(betAmount) || betAmount <= 0 || betAmount > player.balance) {
                alert(`Invalid bet amount for ${player.name}.`);
                validBets = false;
            } else {
                player.bet = betAmount;
                player.balance -= betAmount; // Deduct the bet amount from player's balance
            }
        });

        if (validBets) {
            bettingPage.style.display = 'none';
            gamePage.style.display = 'block';
            startGame();
        }
    });

    // Start the game
    function startGame() {
        fetchNewDeck().then(() => {
            players.forEach(player => player.cards = []);
            dealer.cards = [];
            gameOver = false;

            // Deal initial cards
            players.forEach(player => {
                drawCard(player);
                drawCard(player);
            });

            drawCard(dealer); // Deal one card to the dealer
            drawCard(dealer); // Deal another card to the dealer

            // Update UI after initial deal
            updateUI();
        });
    }

    // Fetch a new deck of cards
    function fetchNewDeck() {
        if (!deckPromise) {
            deckPromise = fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
                .then(response => response.json())
                .then(data => {
                    deckId = data.deck_id;
                    return deckId;
                });
        }
        return deckPromise;
    }

    // Draw a card from the deck
    function drawCard(playerOrDealer) {
        if (gameOver) return;

        return fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
            .then(response => response.json())
            .then(data => {
                const card = data.cards[0];
                playerOrDealer.cards.push(card);
                updateUI();
            })
            .catch(error => console.error('Error drawing card:', error));
    }

    // Update UI with the latest game state
    function updateUI() {
        // Clear previous game state
        gameTableDiv.innerHTML = '';
        gameLogDiv.innerHTML = '';

        // Display dealer's cards
        const dealerDiv = document.createElement('div');
        dealerDiv.id = 'dealer-info';
        dealerDiv.innerHTML = `<h2>Dealer</h2>`;
        const dealerCardsDiv = document.createElement('div');
        dealerCardsDiv.id = 'dealer-cards';

        // Show only the dealer's first card initially
        dealer.cards.forEach((card, index) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card-container';
            cardDiv.innerHTML = `
                <div class="card" style="background-image: url('${index === 0 ? card.image : 'https://via.placeholder.com/71x96'}');"></div>
            `;
            dealerCardsDiv.appendChild(cardDiv);
        });

        dealerDiv.appendChild(dealerCardsDiv);
        gameTableDiv.appendChild(dealerDiv);

        // Display players' hands and controls
        players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-info';
            playerDiv.innerHTML = `<h2>${player.name}</h2>`;
            const playerCardsDiv = document.createElement('div');
            playerCardsDiv.className = 'player-hand';
            player.cards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card-container';
                cardDiv.innerHTML = `
                    <div class="card" style="background-image: url('${card.image}');"></div>
                `;
                playerCardsDiv.appendChild(cardDiv);
            });
            playerDiv.appendChild(playerCardsDiv);

            // Add Hit and Stay buttons for each player
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'player-controls';
            const hitButton = document.createElement('button');
            hitButton.textContent = 'Hit';
            hitButton.addEventListener('click', () => handleHit(index));
            const stayButton = document.createElement('button');
            stayButton.textContent = 'Stay';
            stayButton.addEventListener('click', () => handleStay(index));
            controlsDiv.appendChild(hitButton);
            controlsDiv.appendChild(stayButton);
            playerDiv.appendChild(controlsDiv);

            // Add status area
            const statusDiv = document.createElement('div');
            statusDiv.className = 'player-status';
            statusDiv.id = `status-${index}`;
            statusDiv.innerHTML = ''; // Initialize empty
            playerDiv.appendChild(statusDiv);

            gameTableDiv.appendChild(playerDiv);
        });

        // Display game log
        gameLogDiv.innerHTML = `<p>Game State Updated</p>`;
    }

    // Handle Hit action for a player
    function handleHit(playerIndex) {
        if (gameOver || players[playerIndex].hasStood || players[playerIndex].hasBusted) return;

        drawCard(players[playerIndex]).then(() => {
            const score = calculateScore(players[playerIndex]);
            if (score > 21) {
                players[playerIndex].hasBusted = true;
                document.getElementById(`status-${playerIndex}`).innerText = 'Busted!';
                checkGameOver();
            } else {
                document.getElementById(`status-${playerIndex}`).innerText = '';
            }
        });
    }

    // Handle Stay action for a player
    function handleStay(playerIndex) {
        if (gameOver || players[playerIndex].hasStood || players[playerIndex].hasBusted) return;

        players[playerIndex].hasStood = true;
        document.getElementById(`status-${playerIndex}`).innerText = 'Stayed';
        checkGameOver();
    }

    // Check if the game is over
    function checkGameOver() {
        if (players.every(player => player.hasStood || player.hasBusted)) {
            gameOver = true;
            revealDealerCards();
        }
    }

    // Reveal all dealer cards and complete the dealer's turn
    function revealDealerCards() {
        let dealerScore = calculateScore(dealer);

        while (dealerScore < 17) {
            drawCard(dealer).then(() => {
                dealerScore = calculateScore(dealer);
                if (dealerScore >= 17) {
                    finalizeGame();
                }
            });
        }

        finalizeGame();
    }

    // Finalize the game and determine winners/losers
    function finalizeGame() {
        const dealerScore = calculateScore(dealer);

        players.forEach(player => {
            const playerScore = calculateScore(player);
            const statusDiv = document.getElementById(`status-${players.indexOf(player)}`);

            if (player.hasBusted) {
                statusDiv.innerText = `Busted! Lost $${player.bet}`;
            } else if (playerScore > dealerScore || dealerScore > 21) {
                player.balance += 2 * player.bet; // Win back their bet plus winnings
                statusDiv.innerText = `Won $${player.bet}!`;
            } else if (playerScore === dealerScore) {
                player.balance += player.bet; // Win back their bet
                statusDiv.innerText = 'Push! Bet returned';
            } else {
                statusDiv.innerText = `Lost $${player.bet}`;
            }
        });

        gameOver = true;
        gameLogDiv.innerHTML = `<p>Game Over</p>`;
    }

    // Calculate the score for a hand
    function calculateScore(playerOrDealer) {
        let score = 0;
        let aces = 0;

        playerOrDealer.cards.forEach(card => {
            if (card.value === 'ACE') {
                aces++;
                score += 11;
            } else if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
                score += 10;
            } else {
                score += parseInt(card.value);
            }
        });

        // Adjust for aces
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }

        return score;
    }
});
