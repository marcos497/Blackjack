# Project Title
Blackjack 21 Game !


Let me describe the logic of the game, to start let me explain the value of each card represented in points.
Cards of king, queen and Jack are all always  10 points each card
When a player is randomly delt a Card of Ace 1 or 11 they should have the option of giving it a value of either 1 point or a value of 11, this value may change every time this card randomly delt to the player 


Now that we have gone over the point system, 

1.	All active Players place bets.
2.	Once all bets are placed, the dealer deals two cards face up to each player and two cards to themselves, one facing up and one facing down.
3.	If any players bust by getting over 21 after they receive their two face-up cards, the dealer takes their bets, and they are out of the game.
4.	If any player hits 21 after receiving their two face-up cards, they win 1.5 X their bet and are out of the game.
5.	If players are still in the game and have not hit 21 or bust after receiving their first two cards, they can choose the stay button to stay with their two cards or the hit button and get another card.
6.	If the player hits the hit button, they are dealt another card from the deck. After they are dealt their third card, if they bust and get over 21, they lose their bet to the dealer. If they hit 21, they win 1X their bet and are out of the game. If they get anything under 21, they can choose the stay button or hit it again. If they hit again, number 6 is repeated until all players have chosen to stay. 
7.	Once all players are chosen to stay, the dealer will flip their second card face up. If the second face-up card plus the first face-up card equals 21, then all the players still in the game lose their bets to the dealer, and the game is over
8.	If the dealer's second and first cards face up equals 17, then the dealer stays (go straight to number 13)
9.	If the dealer's two cards equal 16, the dealer hits and is dealt a third card. 
10.	If the dealer's third card hits 21, the dealer wins, everyone in the game loses their bet, and the game ends.
11.	 If the dealer gets over 21, the players get 1X their bets, and the game ends. 
12.	If the dealer's three face-up cards equal between 17-20, the game continues. 
13.	 When the game continues, any player with less than the dealer loses their bets to the dealer; any player with more than the dealer wins 1X their bets, and the game ends. 
14.	If you win or lose you can restart the game with restart button and the loop begins from number 1.




## Technologies Used

JavaScript
HTML
CSS

## External Resources 

Chat Gpt 





Iterator method to pul deck from source and re iterate  for game 


www.chatgpt.com

In addition to, another very helpful tool to understand code language and good for learning how to approach a problem you want to solve in a code. 


## License

Include a license if applicable.



<!-- FOR DEVELOPER  -->
# DEV NOTES 
Key Updates:
Disable Betting Inputs and Submit Button Initially: Added disabled attribute to betting inputs and submit button when displaying the betting table.

Enable Betting Inputs and Submit Button: Added a validateBets function that checks the validity of the entered bets and enables the submit button if all bets are valid.

Event Listener for Betting Inputs: Added an input event listener on the betting table to validate bets as they are entered.

This ensures that players cannot proceed with invalid bets and that they must enter valid bet amounts before continuing with the game.






