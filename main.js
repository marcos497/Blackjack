function getHandTotal(hand) {
    let total = 0;
    let aces = 0;

    // Iterate through each card in the hand
    for (let card of hand) {
        if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
            total += 10; // Face cards are worth 10 points
        } else if (card.value === 'A') {
            total += 11; // Aces initially worth 11 points
            aces += 1;   // Count the Aces
        } else {
            total += parseInt(card.value); // Numeric cards are worth their face value
        }
    }

    // Adjust for Aces if the total is greater than 21
    while (total > 21 && aces > 0) {
        total -= 10; // Convert an Ace from 11 to 1
        aces -= 1;   // Decrease the count of Aces
    }

    return total;
}

// Example usage:
const hand = [
    { value: 'A', suit: 'hearts' },
    { value: '8', suit: 'clubs' },
    { value: '7', suit: 'spades' }
];

console.log(getHandTotal(hand)); // Output should be 16




// jims code piece 

function init() {
    // Several of these state variables need to be
    // re-initialized in the handleDeal function
    // but also need initialization here so that the
    // first call to render() won't cause an error
    outcome = null;
    dHand = [];
    pHand = [];
    pTotal = dTotal = 0;  // Yes you can - assignment happens right to left
    bankroll = 500;
    bet = 0;
    render();
  }

  function handleDeal() {
    outcome = null;
    deck = getNewShuffledDeck();
    dHand = [deck.pop(), deck.pop()];
    pHand = [deck.pop(), deck.pop()];
    // Check for blackjack
    dTotal = getHandTotal(dHand);
    pTotal = getHandTotal(pHand);
    if (dTotal === 21 && pTotal === 21) {
      outcome = 'T'; // Hand is a push/tie
    } else if (dTotal === 21) {
      outcome = 'DBJ'; // Dealer wins with BJ
    } else if (pTotal === 21) {
      outcome = 'PBJ'; // Player wins with BJ
    }
    if (outcome) settleBet();
    render();
  }


  