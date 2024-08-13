document.addEventListener('DOMContentLoaded', () => {
    const startGameBtn = document.getElementById('startGameBtn');
    const betBtn = document.getElementById('betBtn');
    const hitBtn = document.getElementById('hitBtn');
    const stayBtn = document.getElementById('stayBtn');
    const playerForm = document.getElementById('playerForm');
    const playerInputDiv = document.getElementById('playerInput');
    const gameAreaDiv = document.getElementById('gameArea');
    const playerNameInput = document.getElementById('playerNameInput');
    const numberOfPlayersInput = document.getElementById('numberOfPlayersInput');
    const playerNamesDiv = document.getElementById('playerNames');
    const gameLogDiv = document.getElementById('gameLog');
    const playerCardsDiv = document.getElementById('playerCards');
    const dealerCardsDiv = document.getElementById('dealerCards');

    let players = [];
    let dealer = { cards: [], score: 0 };
    let currentPlayerIndex = 0;
    let gameStarted = false;
    let gameOver = false;

    // Limit the number of players to 1-3
    numberOfPlayersInput.addEventListener('input', () => {
        const value = parseInt(numberOfPlayersInput.value);
        if (value < 1) {
            numberOfPlayersInput.value = 1;
        } else if (value > 3) {
            numberOfPlayersInput.value = 3;
        }
    });

    startGameBtn.addEventListener('click', () => {
        const numberOfPlayers = parseInt(numberOfPlayersInput.value);
        if (!numberOfPlayers || numberOfPlayers < 1 || numberOfPlayers > 3) return;

        players = [];
        for (let i = 0; i < numberOfPlayers; i++) {
            const playerName = document.getElementById(`playerName${i + 1}`).value || `Player ${i + 1}`;
            players.push({ name: playerName, cards: [], balance: 25000, bet: 0, hasStood: false, hasBusted: false });
        }

        gameStarted = true;
        gameOver = false;
        dealer = { cards: [], score: 0 };

        playerForm.style.display = 'none';
        gameAreaDiv.style.display = 'block';

        startGame();
    });

    function startGame() {
        // Initialize the game with initial bet placements
        currentPlayerIndex = 0;
        displayMessage('Place your bets!', 'info');
        updateUI();
    }

    betBtn.addEventListener('click', () => {
        const currentPlayer = players[currentPlayerIndex];
        const betAmount = parseInt(document.getElementById(`betAmount${currentPlayerIndex}`).value);

        if (betAmount > 0 && betAmount <= currentPlayer.balance) {
            currentPlayer.bet = betAmount;
            currentPlayer.balance -= betAmount;
            displayMessage(`${currentPlayer.name} placed a bet of $${betAmount}.`, 'info');

            currentPlayerIndex++;
            if (currentPlayerIndex >= players.length) {
                currentPlayerIndex = 0;
                dealInitialCards();
            } else {
                updateUI();
            }
        }
    });

    function dealInitialCards() {
        players.forEach(player => {
            drawCard(player);
            drawCard(player);
        });

        drawCard(dealer);
        drawCard(dealer, true);

        updateUI();
        checkGameOver();
    }

    hitBtn.addEventListener('click', () => {
        const currentPlayer = players[currentPlayerIndex];
        drawCard(currentPlayer);
        updateUI();
        checkPlayerStatus(currentPlayer);

        if (currentPlayer.hasBusted || currentPlayer.hasStood) {
            moveToNextPlayer();
        }
    });

    stayBtn.addEventListener('click', () => {
        players[currentPlayerIndex].hasStood = true;
        displayMessage(`${players[currentPlayerIndex].name} stands.`, 'info');
        moveToNextPlayer();
    });

    function moveToNextPlayer() {
        currentPlayerIndex++;
        if (currentPlayerIndex >= players.length) {
            currentPlayerIndex = 0;
            checkGameOver();
        } else {
            updateUI();
        }
    }

    function drawCard(playerOrDealer, isDealerCard = false) {
        const card = getCard();
        playerOrDealer.cards.push(card);
        if (!isDealerCard) {
            displayMessage(`${playerOrDealer.name || 'Dealer'} drew ${card.rank} of ${card.suit}.`, 'info');
        }
        updateUI();
    }

    function getCard() {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING', 'ACE'];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const rank = ranks[Math.floor(Math.random() * ranks.length)];
        return { suit, rank };
    }

    function updateUI() {
        // Update Player and Dealer Cards
        players.forEach((player, index) => {
            const playerCards = document.getElementById(`playerCards-${index}`);
            playerCards.innerHTML = player.cards.map(card => `${card.rank} of ${card.suit}`).join(', ');

            const playerStatus = document.getElementById(`status-${index}`);
            if (player.hasBusted) {
                playerStatus.innerText = 'Busted!';
            } else if (player.hasStood) {
                playerStatus.innerText = 'Standing';
            } else {
                playerStatus.innerText = '';
            }
        });

        dealerCardsDiv.innerHTML = dealer.cards.map(card => `${card.rank} of ${card.suit}`).join(', ');
    }

    function checkPlayerStatus(player) {
        const score = calculateScore(player);
        if (score > 21) {
            player.hasBusted = true;
            displayMessage(`${player.name} busted with a score of ${score}.`, 'warning');
        }
    }

    function checkGameOver() {
        const allPlayersDone = players.every(player => player.hasStood || player.hasBusted);

        if (allPlayersDone) {
            while (calculateScore(dealer) < 17) {
                drawCard(dealer);
            }

            determineWinners();
            gameOver = true;
            updateUI();
        }
    }

    function calculateScore(playerOrDealer) {
        let score = 0;
        let aceCount = 0;

        playerOrDealer.cards.forEach(card => {
            const cardValue = card.rank;
            if (cardValue === 'ACE') {
                aceCount += 1;
                score += 11;
            } else if (['KING', 'QUEEN', 'JACK'].includes(cardValue)) {
                score += 10;
            } else {
                score += parseInt(cardValue);
            }
        });

        while (score > 21 && aceCount > 0) {
            score -= 10;
            aceCount -= 1;
        }

        return score;
    }

    function determineWinners() {
        const dealerScore = calculateScore(dealer);

        players.forEach(player => {
            const playerScore = calculateScore(player);
            const statusDiv = document.getElementById(`status-${players.indexOf(player)}`);
            if (player.hasBusted) {
                statusDiv.innerText = 'You lost!';
            } else if (dealerScore > 21 || playerScore > dealerScore) {
                player.balance += player.bet * 2;
                statusDiv.innerText = 'You won!';
            } else if (playerScore === dealerScore) {
                player.balance += player.bet; // Return the bet
                statusDiv.innerText = 'Push! Bet returned.';
            } else {
                statusDiv.innerText = 'You lost!';
            }
        });
    }

    function displayMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.innerText = message;
        gameLogDiv.appendChild(messageDiv);
    }
});
