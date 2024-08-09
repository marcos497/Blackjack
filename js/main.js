document.addEventListener('DOMContentLoaded', () => {
    const numPlayersInput = document.getElementById('numPlayers');
    const playerNamesDiv = document.getElementById('playerNames');
    const submitPlayersBtn = document.getElementById('submitPlayers');
    const submitNamesBtn = document.getElementById('submitNames');
    const bettingPhaseDiv = document.getElementById('betting-phase');
    const betsDiv = document.getElementById('bets');
    const submitBetsBtn = document.getElementById('submitBets');
    const gameDiv = document.getElementById('game');
    const dealerCardsDiv = document.getElementById('dealer-cards');
    const playerCardsDiv = document.getElementById('player-cards');

    let players = [];
    let numPlayers = 0;

    // Handle the submission of the number of players
    submitPlayersBtn.addEventListener('click', () => {
        numPlayers = parseInt(numPlayersInput.value, 10);
        playerNamesDiv.innerHTML = ''; // Clear any existing content

        if (numPlayers > 0 && numPlayers <= 5) {
            // Dynamically create input fields for each player's name
            for (let i = 0; i < numPlayers; i++) {
                playerNamesDiv.innerHTML += `
                    <div>
                        <label for="playerName-${i}">Player ${i + 1} Name:</label>
                        <input type="text" id="playerName-${i}" required>
                    </div>
                `;
            }

            // Show the input fields and submit button for player names
            playerNamesDiv.style.display = 'block';
            submitNamesBtn.style.display = 'inline-block';

            // Hide the submit button for number of players
            submitPlayersBtn.style.display = 'none';
        } else {
            alert("Please enter a valid number of players (between 1 and 5).");
        }
    });

    // Handle the submission of player names
    submitNamesBtn.addEventListener('click', () => {
        players = [];

        // Collect player names
        for (let i = 0; i < numPlayers; i++) {
            const playerName = document.getElementById(`playerName-${i}`).value;
            if (playerName) {
                players.push(playerName);
            } else {
                alert(`Please enter a name for Player ${i + 1}.`);
                return;
            }
        }

        // Transition to the betting phase
        document.getElementById('player-setup').style.display = 'none';
        bettingPhaseDiv.style.display = 'block';

        // Create betting areas for each player
        betsDiv.innerHTML = '';
        players.forEach((player, index) => {
            betsDiv.innerHTML += `
                <div class="player-area">
                    <h2>${player}</h2>
                    <div class="bet-area">
                        <input type="number" id="bet-${index}" min="1" placeholder="Enter bet">
                    </div>
                </div>
            `;
        });
    });

    // Handle the submission of bets
    submitBetsBtn.addEventListener('click', () => {
        let bets = {};
        players.forEach((player, index) => {
            const bet = parseInt(document.getElementById(`bet-${index}`).value, 10);
            if (isNaN(bet) || bet <= 0) {
                alert(`Invalid bet for ${player}`);
                return;
            }
            bets[player] = bet;
        });

        bettingPhaseDiv.style.display = 'none';
        gameDiv.style.display = 'block';
        dealCards();
    });

    // Function to deal initial cards
    function dealCards() {
        dealerCardsDiv.innerHTML = '<h2>Dealer Cards:</h2><div class="card">?</div><div class="card">?</div>';
        playerCardsDiv.innerHTML = '';

        players.forEach(player => {
            playerCardsDiv.innerHTML += `
                <div class="player-area">
                    <h2>${player}'s Cards</h2>
                    <div class="card">?</div><div class="card">?</div>
                </div>
            `;
        });
    }
});
