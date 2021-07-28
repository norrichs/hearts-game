// * GameState
deck = [
	'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13', 'c14',
	's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14',
	'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'd14',
	'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13', 'h14'
];

// TODO Game State will be stored on database with a GET at the begining of each turn and a PUT at the end
gameState = {
	turn : 0,
	player : "player1",
	heartsBroken: false,
	hand: 0,
	winScore: 100,
	playerOrder: [ 0, 1, 2, 3],
	players : [
		{
			name: "player one",
			type: "human",
			position: 0,
			score: 0,
			hand: [],
			receivedPass: [],
			tricks: []
		},
		{
			name: "player two",
			type: "human",
			position: 1,
			score: 0,
			hand: [],
			receivedPass: [],
			tricks: []
		},
		{
			name: "player three",
			type: "human",
			position: 2,
			score: 0,
			hand: [],
			receivedPass: [],
			tricks: []
		},
		{
			name: "player four",
			type: "human",
			position: 3,
			score: 0,
			hand: [],
			receivedPass: [],
			tricks: []
		}

	]
}






// * Init Game
//		Set player names, positions, order, type, etc.
const initGame = (config) => {

}

// * Shuffle and deal
//		Select a random card from the deck array, removing
//		that card.  Do so till deck is empty, distributing cards
//		sequentially to players
const dealGame = (deck) => {
	for (let card = 0; card < 52; card ++){
		// Get random index based un-dealt deck size
		const i = Math.floor(Math.random() * (52-card)) 
		// Push to player hand and remove from deck
		gameState.players[card % 4].hand.push( deck[i] )
		deck.splice(i,1)
	}
}


// * Check if a player has a given suit
const hasSuit = (playerHand, suit) => {
	return playerHand.map(card => card.substr(0,1)).includes(suit)
}


// * Display Hands
const displayHands = (g) => {
	for(p of g.players)
	console.log(`player${p.position} hand:`, p.hand)
}

// * Set First Player
//		Assigns first status to player w/ 2 of clubs in hand
const setFirstPlayer = () => {
	for(let i = 0; i < 4; i++){
		if ( gameState.players[i].hand.includes('c2') ) return i;
	}
}


// * Hand Cycle
const playHand = (firstPlayerNumber) => {
	
	
}





///////////////////////////////////////
// AI Functions
///////////////////////////////////////
// * AI pass card
//		Stub function - choose 3 random cards to pass
const passCardAI = (playerNum) => {
	let hand = [...gameState.players[playerNum].hand];
	const cardsToPass = [];
	for (let i = 0; i < 3; i++){
		let randIndex = Math.floor( Math.random * hand.length);
		cardsToPass.push(hand.randIndex);
		hand.splice(randIndex, 1)
	}
	return cardsToPass;
}

const doDumpQueen = (playedCards) => {

}

// * AI choose card to play
//		Stub function - choose one random playable card
//		Strategy: lowest card of most populous suit, unless hearts broken, then lowest heart
const chooseCardAI = (strategy, playedCards, playerNum) => {
	let hand = [...gameState.players[playerNum].hand]
	let chosenCard = '';
	if(doDumpQueen(playedCards) && hand.includes('s12')) 
	if (strategy === 'low'){
		if(gameState.heartsBroken){
			// filter hand for hearts
			// sort hearts
			// choose lowest
			// splice / remove chosen card by indexOf
		}else{

		}

	}

	return chosenCard

}





// * Game cycle
const gameCycle = () => {
	initGame({
		winScore: 100,
		userName: "ben"
	})
	
	while ( gameState.maxScore < gameState.winScore){
		dealGame([...deck])
		displayHands(gameState)  // TODO - remove, for dev only
		passCards()
		gameState.maxScore = playHand( setFirstPlayer() )
	}
	gameWinEvent()
}

gameCycle()