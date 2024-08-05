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
