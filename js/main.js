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
    let deck = [];
    let gameOver = false;

    // Start button functionality
    startButton.addEventListener('click', () => {
        document.getElementById('landing-page').style.display = 'none';
        introPage.style.display = 'block';
    });

    // Update the UI
    function updateUI() {
        gameTableDiv.innerHTML = '';
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-info';
            playerDiv.innerHTML = `
                <h3>${player.name}</h3>
                <div class="player-hand">${player.cards.map(card => `<div class="card ${card.suit} ${card.value}" style="background-image: url('${card.image}');"></div>`).join('')}</div>
                <div>Balance: ${player.balance}</div>
                <div>Bet: ${player.bet}</div>
            `;
            gameTableDiv.appendChild(playerDiv);
        });

        const dealerDiv = document.createElement('div');
        dealerDiv.id = 'dealer-info';
        dealerDiv.innerHTML = `
            <h3>Dealer</h3>
            <div id="dealer-cards" class="player-hand">
                <div class="card back"></div> <!-- Face down card -->
                ${dealer.cards.slice(1).map(card => `<div class="card ${card.suit} ${card.value}" style="background-image: url('${card.image}');"></div>`).join('')}
            </div>
        `;
        gameTableDiv.appendChild(dealerDiv);

        gameLogDiv.innerHTML = '';
    }

    // When dealer starts their turn, reveal the first card
    function revealDealerCard() {
        const dealerFirstCard = dealer.cards[0];
        document.querySelector('#dealer-cards .card.back').style.backgroundImage = `url('${dealerFirstCard.image}')`;
    }

    // Submit players functionality
    submitPlayersButton.addEventListener('click', () => {
        const numPlayers = parseInt(numPlayersInput.value);
        if (numPlayers < 1 || numPlayers > 3) {
            gameLogDiv.innerHTML = 'Please enter a number between 1 and 3.';
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
                    players.push({
                        name,
                        balance: 25000,
                        bet: 0,
                        cards: [],
                        hasStood: false,
                        hasBusted: false
                    });
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
                gameLogDiv.innerHTML = `Invalid bet amount for ${player.name}.`;
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

    // Start the game
    function startGame() {
        fetchDeck().then(fetchedDeck => {
            deck = fetchedDeck;
            drawInitialCards();
        });
    }

    function drawInitialCards() {
        const drawPromises = [];

        players.forEach(player => drawPromises.push(drawCard(player)));
        drawPromises.push(drawCard(dealer));
        drawPromises.push(drawCard(dealer));

        Promise.all(drawPromises)
            .then(() => {
                players.forEach(player => {
                    player.cards.push(player.cards.pop());
                });
                dealer.cards.push(dealer.cards.pop());
                updateUI();
            });
    }

    // Draw a card from the deck
    function drawCard(playerOrDealer) {
        const card = deck.pop();
        playerOrDealer.cards.push(card);
        return card;
    }

    // Calculate hand value
    function calculateHandValue(cards) {
        let value = 0;
        let numAces = 0;

        cards.forEach(card => {
            if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
                value += 10;
            } else if (card.value === 'ACE') {
                value += 11;
                numAces += 1;
            } else {
                value += parseInt(card.value);
            }
        });

        while (value > 21 && numAces > 0) {
            value -= 10;
            numAces -= 1;
        }

        return value;
    }
});

// Function to fetch deck from the card API
async function fetchDeck() {
    try {
        const response = await fetch('http://localhost:3000/deck');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.cards;
    } catch (error) {
        console.error('Error fetching deck:', error);
        return [];
    }
}
