document.addEventListener('DOMContentLoaded', function() {
    let players = [];
    let dealer = { name: "Dealer", hand: [], balance: 0, bet: 0 };
    let currentPlayerIndex = 0;
    let deck = [];

    const suits = ['♣', '♦', '♥', '♠'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const values = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': [1, 11]
    };

    function createDeck() {
        deck = [];
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push({ suit, rank, value: values[rank] });
            }
        }
        shuffleDeck();
    }

    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function startGame() {
        // Redirect to intro page for player details and bets
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('introPage').style.display = 'block';
    }

    function initiateGame() {
        // Collect player names and bets, initialize game setup
        const playerNames = Array.from(document.querySelectorAll('.player-name')).map(input => input.value.trim());
        const playerBalances = Array.from(document.querySelectorAll('.player-balance')).map(input => parseInt(input.value.trim(), 10));
        
        players = playerNames.map((name, index) => ({
            name,
            hand: [],
            balance: playerBalances[index] || 0,
            bet: 0
        }));

        createDeck();
        document.getElementById('introPage').style.display = 'none';
        document.getElementById('gamePage').style.display = 'block';
        updateUI();
    }

    function updateUI() {
        // Update the game UI with player details, dealer, and bets
        const playerContainer = document.getElementById('players');
        playerContainer.innerHTML = '';
        players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.classList.add('player');
            playerDiv.innerHTML = `
                <div class="name">${player.name}</div>
                <div class="balance">Balance: $${player.balance}</div>
                <div class="bet">Bet: $${player.bet}</div>
                <div class="hand">Hand: ${player.hand.map(card => `${card.rank}${card.suit}`).join(', ')}</div>
            `;
            playerContainer.appendChild(playerDiv);
        });

        const dealerContainer = document.getElementById('dealer');
        dealerContainer.innerHTML = `
            <div class="name">${dealer.name}</div>
            <div class="hand">Hand: ${dealer.hand.map(card => `${card.rank}${card.suit}`).join(', ')}</div>
        `;

        const actionContainer = document.getElementById('actions');
        actionContainer.innerHTML = '';
        if (currentPlayerIndex < players.length) {
            const currentPlayer = players[currentPlayerIndex];
            const betInput = document.createElement('input');
            betInput.type = 'number';
            betInput.id = 'betInput';
            betInput.min = 1;
            betInput.max = Math.min(20000, currentPlayer.balance);
            betInput.placeholder = 'Enter your bet';
            actionContainer.appendChild(betInput);

            const placeBetButton = document.createElement('button');
            placeBetButton.innerText = 'Place Bet';
            placeBetButton.addEventListener('click', placeBet);
            actionContainer.appendChild(placeBetButton);
        } else {
            dealInitialCards();
        }
    }

    function placeBet() {
        const betAmount = parseInt(document.getElementById('betInput').value, 10);
        if (isNaN(betAmount) || betAmount < 1) {
            alert('Please enter a valid bet amount');
            return;
        }

        players[currentPlayerIndex].bet = betAmount;
        players[currentPlayerIndex].balance -= betAmount;
        currentPlayerIndex++;
        updateUI();
    }

    function dealInitialCards() {
        // Deal two cards to each player and the dealer
        for (let i = 0; i < 2; i++) {
            players.forEach(player => player.hand.push(deck.pop()));
            dealer.hand.push(deck.pop());
        }

        updateUI();
        nextAction();
    }

    function nextAction() {
        // Determine the next action for the current player
        if (currentPlayerIndex < players.length) {
            const currentPlayer = players[currentPlayerIndex];
            const actionContainer = document.getElementById('actions');
            actionContainer.innerHTML = `
                <button id="hitButton">Hit</button>
                <button id="stayButton">Stay</button>
            `;

            document.getElementById('hitButton').addEventListener('click', () => hit(currentPlayer));
            document.getElementById('stayButton').addEventListener('click', () => stay(currentPlayer));
        } else {
            dealerTurn();
        }
    }

    function hit(player) {
        // Deal a card to the player
        player.hand.push(deck.pop());
        if (calculateHandValue(player.hand) > 21) {
            player.balance = 0; // Bust
            alert(`${player.name} Busted!`);
        }
        nextAction();
    }

    function stay(player) {
        currentPlayerIndex++;
        nextAction();
    }

    function dealerTurn() {
        // Dealer's turn to play
        while (calculateHandValue(dealer.hand) < 17) {
            dealer.hand.push(deck.pop());
        }

        if (calculateHandValue(dealer.hand) > 21) {
            alert('Dealer Busts! All remaining players win.');
            players.forEach(player => {
                if (player.balance > 0) {
                    player.balance += player.bet * 2;
                }
            });
        } else {
            determineWinners();
        }

        updateUI();
    }

    function calculateHandValue(hand) {
        let value = 0;
        let aces = 0;

        hand.forEach(card => {
            if (card.rank === 'A') {
                aces++;
                value += 11;
            } else {
                value += card.value;
            }
        });

        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }

        return value;
    }

    function determineWinners() {
        const dealerValue = calculateHandValue(dealer.hand);
        players.forEach(player => {
            if (player.balance > 0) {
                const playerValue = calculateHandValue(player.hand);
                if (playerValue > dealerValue) {
                    player.balance += player.bet * 2;
                    alert(`${player.name} wins!`);
                } else {
                    alert(`${player.name} loses.`);
                }
            }
        });
    }

    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('initiateGameButton').addEventListener('click', initiateGame);
});
