document.addEventListener('DOMContentLoaded', () => {
    const numberOfPlayersInput = document.getElementById('numberOfPlayersInput');
    const submitNumberOfPlayersButton = document.getElementById('submitNumberOfPlayers');
    const playerNamesSection = document.getElementById('playerNamesSection');
    const playerInputsContainer = document.getElementById('playerInputsContainer');
    const submitPlayerNamesButton = document.getElementById('submitPlayerNames');
    const activePlayersSection = document.getElementById('activePlayers');
    const playersList = document.getElementById('playersList');

    let numberOfPlayers = 0;
    let playerNames = [];

    // Handle the number of players submission
    submitNumberOfPlayersButton.addEventListener('click', () => {
        numberOfPlayers = parseInt(numberOfPlayersInput.value, 10);
        if (isNaN(numberOfPlayers) || numberOfPlayers < 1) {
            alert('Please enter a valid number of players.');
            return;
        }

        // Hide number of players section and show player names section
        document.getElementById('numberOfPlayersSection').style.display = 'none';
        playerNamesSection.style.display = 'block';

        // Generate input fields for player names
        playerInputsContainer.innerHTML = '';
        for (let i = 0; i < numberOfPlayers; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Player ${i + 1} name`;
            input.id = `playerName${i + 1}`;
            playerInputsContainer.appendChild(input);
        }
    });

    // Handle the player names submission
    submitPlayerNamesButton.addEventListener('click', () => {
        playerNames = [];
        for (let i = 0; i < numberOfPlayers; i++) {
            const nameInput = document.getElementById(`playerName${i + 1}`);
            const name = nameInput.value.trim();
            if (name) {
                playerNames.push(name);
            } else {
                alert('Please enter a name for all players.');
                return;
            }
        }

        // Display the list of active players
        playerNamesSection.style.display = 'none';
        activePlayersSection.style.display = 'block';

        playersList.innerHTML = '';
        playerNames.forEach(name => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = name;
            playersList.appendChild(playerDiv);
        });

        // Initialize the game or proceed to the betting phase
        initializeGame();
    });

    // Function to initialize the game (placeholder)
    function initializeGame() {
        console.log('Game initialized with players:', playerNames);
        // You can add logic here to start the game, show betting options, etc.
    }
});
