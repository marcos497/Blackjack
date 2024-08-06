document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const playersForm = document.getElementById('playersForm');
    const gameContainer = document.getElementById('gameContainer');
    const playerInputs = document.getElementById('playerInputs');
    const dealerElement = document.getElementById('dealer');
    const messages = document.getElementById('messages');
    const placeBetBtn = document.getElementById('placeBetBtn');
    const hitBtn = document.getElementById('hitBtn');
    const stayBtn = document.getElementById('stayBtn');
    const restartBtn = document.getElementById('restartBtn');
    let players = [];
    let dealer = { name: 'Dealer', hand: [], balance: 0, isDealer: true };
    let currentPlayerIndex = 0;
    let deck = [];
    const playerBalances = {};

    function initializeGame() {
        players = [];
        dealer = { name: 'Dealer', hand: [], balance: 0, isDealer: true };
        currentPlayerIndex = 0;
        deck = createDeck();
        shuffleDeck(deck);
        messages.innerHTML = '';
        gameContainer.innerHTML = '';
    }

    function startGame() {
        startBtn.style.display = 'none';
        playersForm.style.display = 'block';
        playerInputs.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Player ${i + 1} Name`;
            input.className = 'player-input';
            input.dataset.index = i;
            playerInputs.appendChild(input);
        }
    }

    function createDeck() {
        const suits = ['♣', '♦', '♥', '♠'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck = [];
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({ suit, rank, value: getCardValue(rank) });
            }
        }
        return deck;
    }

    function getCardValue(rank) {
        if (rank === 'J' || rank === 'Q' || rank === 'K') {
            return 10;
        } else if (rank === 'A') {
            return 11; // Default to 11, will adjust later if necessary
        } else {
            return parseInt(rank);
        }
    }

    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function dealInitialCards() {
        for (const player of players) {
            player.hand.push(deck.pop());
            player.hand.push(deck.pop());
            updatePlayerDisplay(player);
        }
        dealer.hand.push(deck.pop());
        dealer.hand.push(deck.pop());
        updatePlayerDisplay(dealer);
        displayMessage(`Dealer's face-up card is ${dealer.hand[0].rank}${dealer.hand[0].suit}`);
    }

    function updatePlayerDisplay(player) {
        const playerElement = document.getElementById(`player-${player.name}`);
        if (!playerElement) {
            const newPlayerElement = document.createElement('div');
            newPlayerElement.id = `player-${player.name}`;
            newPlayerElement.className = 'player';
            newPlayerElement.innerHTML = `
                <h3>${player.name}</h3>
                <p>Balance: $<span id="balance-${player.name}">${player.balance}</span></p>
                <p>Hand: <span id="hand-${player.name}">${getHandString(player.hand)}</span></p>
            `;
            gameContainer.appendChild(newPlayerElement);
        } else {
            document.getElementById(`balance-${player.name}`).textContent = player.balance;
            document.getElementById(`hand-${player.name}`).textContent = getHandString(player.hand);
        }
    }

    function getHandString(hand) {
        return hand.map(card => `${card.rank}${card.suit}`).join(', ');
    }

    function displayMessage(message) {
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messages.appendChild(messageElement);
    }

    function calculateHandValue(hand) {
        let value = 0;
        let numAces = 0;
        for (const card of hand) {
            value += card.value;
            if (card.rank === 'A') {
                numAces++;
            }
        }
        while (value > 21 && numAces > 0) {
            value -= 10;
            numAces--;
        }
        return value;
    }

    function handlePlayerAction(action) {
        const player = players[currentPlayerIndex];
        if (action === 'hit') {
            player.hand.push(deck.pop());
            updatePlayerDisplay(player);
            const handValue = calculateHandValue(player.hand);
            if (handValue > 21) {
                displayMessage(`${player.name} busts!`);
                currentPlayerIndex++;
                if (currentPlayerIndex >= players.length) {
                    dealerTurn();
                }
            }
        } else if (action === 'stay') {
            currentPlayerIndex++;
            if (currentPlayerIndex >= players.length) {
                dealerTurn();
            }
        }
    }

    function dealerTurn() {
        let handValue = calculateHandValue(dealer.hand);
        while (handValue < 17) {
            dealer.hand.push(deck.pop());
            handValue = calculateHandValue(dealer.hand);
            updatePlayerDisplay(dealer);
        }
        determineWinners();
    }

    function determineWinners() {
        const dealerHandValue = calculateHandValue(dealer.hand);
        for (const player of players) {
            const playerHandValue = calculateHandValue(player.hand);
            if (playerHandValue > 21) {
                displayMessage(`${player.name} busts and loses $${player.bet}`);
                player.balance -= player.bet;
            } else if (dealerHandValue > 21 || playerHandValue > dealerHandValue) {
                displayMessage(`${player.name} wins $${player.bet}`);
                player.balance += player.bet;
            } else if (playerHandValue < dealerHandValue) {
                displayMessage(`${player.name} loses $${player.bet}`);
                player.balance -= player.bet;
            } else {
                displayMessage(`${player.name} pushes`);
            }
            updatePlayerDisplay(player);
        }
        updatePlayerDisplay(dealer);
        showRestartButton();
    }

    function showRestartButton() {
        restartBtn.style.display = 'block';
    }

    startBtn.addEventListener('click', startGame);

    playersForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const playerNames = Array.from(document.querySelectorAll('.player-input')).map(input => input.value).filter(name => name.trim() !== '');
        if (playerNames.length === 0) {
            alert('Please enter at least one player name.');
            return;
        }
        players = playerNames.map(name => ({ name, hand: [], balance: 20000, bet: 0 }));
        playersForm.style.display = 'none';
        gameContainer.style.display = 'block';
        placeBetBtn.style.display = 'block';
        dealInitialCards();
    });

    placeBetBtn.addEventListener('click', () => {
        const betAmount = parseInt(prompt('Enter your bet amount:'), 10);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > 20000) {
            alert('Invalid bet amount. Please enter a number between 1 and 20000.');
            return;
        }
        const player = players[currentPlayerIndex];
        if (betAmount > player.balance) {
            alert('Insufficient balance for this bet.');
            return;
        }
        player.bet = betAmount;
        displayMessage(`${player.name} bets $${betAmount}`);
        currentPlayerIndex++;
        if (currentPlayerIndex >= players.length) {
            currentPlayerIndex = 0;
            placeBetBtn.style.display = 'none';
            hitBtn.style.display = 'block';
            stayBtn.style.display = 'block';
        }
    });

    hitBtn.addEventListener('click', () => handlePlayerAction('hit'));
    stayBtn.addEventListener('click', () => handlePlayerAction('stay'));
    restartBtn.addEventListener('click', initializeGame);
});
