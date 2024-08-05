document.addEventListener('DOMContentLoaded', () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const numPlayers = 5;
    const players = [];
    const playerHands = Array.from({ length: numPlayers }, () => []);
    let dealerHand = [];
    const deck = [];
    let currentPlayerIndex = 0;
    let gameOver = false;
    let balance = 1000;
    let currentBet = 0;

    function createDeck() {
        for (let suit of suits) {
            for (let value of values) {
                deck.push({ suit, value });
            }
        }
    }

    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function startGame() {
        deck.length = 0;
        createDeck();
        shuffleDeck();
        playerHands.forEach(hand => hand.length = 0); // Clear previous hands
        dealerHand = [];
        createPlayers();

        for (let i = 0; i < 2; i++) {
            playerHands.forEach(hand => hand.push(deck.pop()));
            dealerHand.push(deck.pop());
        }

        renderHands();
        renderDeck();
        document.getElementById('status').textContent = '';
        gameOver = false;
    }

    function createPlayers() {
        players.length = 0;
        for (let i = 0; i < numPlayers; i++) {
            players.push({ id: i, name: `Player ${i + 1}` });
        }
    }

    function calculateHandValue(hand) {
        let value = 0;
        let aceCount = 0;
        for (let card of hand) {
            if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
                value += 10;
            } else if (card.value === 'A') {
                value += 11;
                aceCount++;
            } else {
                value += parseInt(card.value);
            }
        }
        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }
        return value;
    }

    function renderHands() {
        // Render dealer's hand
        document.getElementById('dealer-cards').innerHTML = dealerHand.map(card => 
            `<img src="images/cards/${card.value}_of_${card.suit}.png" alt="${card.value} of ${card.suit}">`
        ).join('');

        // Render each player's hand
        const playersContainer = document.getElementById('players-container');
        playersContainer.innerHTML = players.map((player, index) => `
            <div class="player-area" id="player-${index}">
                <h3>${player.name}</h3>
                <div class="card-container">
                    ${playerHands[index].map(card => 
                        `<img src="images/cards/${card.value}_of_${card.suit}.png" alt="${card.value} of ${card.suit}">`
                    ).join('')}
                </div>
            </div>
        `).join('');
    }

    function renderDeck() {
        // Render the deck of cards (for demonstration purposes)
        document.getElementById('deck-container').innerHTML = deck.map(card => 
            `<img src="images/cards/${card.value}_of_${card.suit}.png" alt="${card.value} of ${card.suit}">`
        ).join('');
    }

    function checkForEndOfGame() {
        const playerValue = calculateHandValue(playerHands[currentPlayerIndex]);
        const dealerValue = calculateHandValue(dealerHand);

        if (playerValue === 21 && playerHands[currentPlayerIndex].length === 2) {
            document.getElementById('status').textContent = `${players[currentPlayerIndex].name} has Blackjack!`;
            gameOver = true;
            return;
        }

        if (playerValue > 21) {
            document.getElementById('status').textContent = `${players[currentPlayerIndex].name} busted!`;
            moveToNextPlayer();
            return;
        }

        if (dealerValue > 21) {
            document.getElementById('status').textContent = 'Dealer busted! You win!';
            gameOver = true;
            return;
        }

        if (gameOver) {
            if (dealerValue > 21 || playerValue > dealerValue) {
                document.getElementById('status').textContent = `${players[currentPlayerIndex].name} wins!`;
                balance += currentBet * 2; // Win bet
            } else if (dealerValue === playerValue) {
                document.getElementById('status').textContent = 'It\'s a tie!';
                balance += currentBet; // Push bet
            } else {
                document.getElementById('status').textContent = 'Dealer wins.';
            }
            document.getElementById('balance').textContent = `Balance: $${balance}`;
        }
    }

    function dealerPlays() {
        while (calculateHandValue(dealerHand) < 17) {
            dealerHand.push(deck.pop());
        }
        renderHands();
        checkForEndOfGame();
    }

    function handleHit() {
        if (!gameOver) {
            const currentPlayer = getCurrentPlayer();
            currentPlayer.push(deck.pop());
            renderHands();
            if (calculateHandValue(currentPlayer) > 21) {
                document.getElementById('status').textContent = `${players[currentPlayerIndex].name} busted!`;
                moveToNextPlayer();
            }
        }
    }

    function handleStand() {
        if (!gameOver) {
            moveToNextPlayer();
        }
    }

    function moveToNextPlayer() {
        if (currentPlayerIndex < numPlayers - 1) {
            currentPlayerIndex++;
            document.getElementById('status').textContent = `${players[currentPlayerIndex].name}'s turn.`;
        } else {
            gameOver = true;
            dealerPlays();
        }
        renderHands();
    }

    function getCurrentPlayer() {
        return playerHands[currentPlayerIndex];
    }

    document.getElementById('hit-button').addEventListener('click', handleHit);
    document.getElementById('stand-button').addEventListener('click', handleStand);
    document.getElementById('reset-button').addEventListener('click', startGame);

    document.getElementById('place-bet').addEventListener('click', () => {
        const betAmount = parseInt(document.getElementById('bet-amount').value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            alert('Invalid bet amount');
            return;
        }
        currentBet = betAmount;
        balance -= currentBet;
        document.getElementById('balance').textContent = `Balance: $${balance}`;
        startGame();
    });

    startGame(); // Initialize the game when the page loads
});