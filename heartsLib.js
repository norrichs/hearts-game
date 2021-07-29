const deck = [
	'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13', 'c14',
	's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14',
	'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'd14',
	'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13', 'h14'
];

// * Shuffle and deal
//		Select a random card from the deck array, removing
//		that card.  Do so till deck is empty, distributing cards
//		sequentially to players
const dealGame = (gameState, deck) => {
	// Reset hands
	gameState.players.forEach(player => player.hand = [])

	for (let card = 0; card < 52; card ++){
		// Get random index based un-dealt deck size
		const i = Math.floor(Math.random() * (52-card)) 
		// Push to player hand and remove from deck
		gameState.players[card % 4].hand.push( deck[i] )
		deck.splice(i,1)
	}
	return gameState
}

module.exports = {deck, dealGame}