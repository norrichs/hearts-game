const express = require("express");
const router = express.Router();
const GameState = require("../models/gamestate");
// Game init data
const gameStateInit = require("../db/seedGameState.json")
// Hearts Game Library
const hearts = require('../heartsLib.js')

// Get Gamestate 
//	TODO configure alt SHOW route if multiple games allowed on server e.g. leaderboard, etc
router.get("/getState/:id", async (req, res) => {
	const gameState = await GameState.findById(req.params.id)
	res.json({
		status: 200,
		data: gameState
	}) 
})


// Get GamesListing
router.get("/", async (req, res) => {
	const allGameStates = await GameState.find({})
	res.json({
		status: 200,
		data: allGameStates
	}) 
})

// Set GameState
router.put('/setState/:id', async (req, res) => {
	const gameState = await GameState.findByIdAndUpdate(req.params.id, req.body, {new: true})
	res.json({
		status: 200,
		data: gameState
	})
})

// Reset Game states

// when called, this route handles the exchange of cards between players
// TODO - offload the logic of this route to a library function so it can be called by the AI card selection route

// TODO
//	1 Set active player at end of pass-cycle
//  2 Set active player at end of trick

router.put('/passCards/:id', async (req, res) => {
	let gameState = await GameState.findByIdAndUpdate(req.params.id, req.body, {new: true})
	// Check if all players have selected passes, handle exchanges if so.
	let passCardsTotal = 0;
	gameState.players.forEach(player=>{
		passCardsTotal += player.passes.length
	})
	if(passCardsTotal === 12){
		// pass cards appropriately
		const t = gameState.turn
		gameState.players = gameState.players.map((player, i)=>{
			const receiveFrom = hearts.passMap.turn[t].player[i]
			player.receivedPass = [...gameState.players[ receiveFrom ].passes]
			player.hand.push(gameState.players[ receiveFrom ].passes.pop())
			player.hand.push(gameState.players[ receiveFrom ].passes.pop())
			player.hand.push(gameState.players[ receiveFrom ].passes.pop())
			player.hand.sort(hearts.compareCards)
			return player
		})
		gameState.phase = "tricks"
		// Set active player

		gameState.players.forEach((player, i)=>{
			if(player.hand.includes('c2')) gameState.activePlayer = i
		})

		if(gameState.players[gameState.activePlayer].playerType === computer){
			hearts.pickCard(gameState, gameState.activePlayer, 'random')
		}

	}
	gameState = await GameState.findByIdAndUpdate(req.params.id, gameState, {new: true})
	console.log('player hands', gameState.players[0].hand, gameState.players[1].hand, gameState.players[2].hand, gameState.players[3].hand)
	res.json({
		status: 200,
		data: gameState
	})
})

router.put('/playCard/:id', async (req, res) => {
	let gameState = await GameState.findByIdAndUpdate(req.params.id, req.body, {new: true})

	res.json({
		status: 200,
		data: gameState
	})
})



// Initialize Game Instance
router.get('/seed', async (req, res) => {
	console.log('initializing game')
	const gameState = await GameState.create(gameStateInit)
	res.json({
		status: 200, 
		msg: "game initialized",
		data: gameState
	})

})




// Deal Hand
router.get("/deal/:id", async (req, res) => {
	let gameState = await GameState.findById(req.params.id)
	console.log('state', gameState)
	// Deal random cards to each player hand
	gameState = hearts.dealGame(gameState, [...hearts.deck])
	gameState.phase = "pass"
	gameState.trickNum = 1;
	// Select cards to pass for all computer players
	gameState = hearts.selectAIPassCards(gameState)

	// Write dealt and pass-selected game state to DB and respond with up-to-date state
	gameState = await GameState.findByIdAndUpdate(req.params.id, gameState, {new: true})
	res.json({
		status: 200,
		data: gameState
	}) 
})

// Resolve a card selection in player's hand
router.get("/selectCard/:gameId/:user/:clickedCardId", async (req, res) => {
	console.log('select card router parameters', req.params)
	let gameState = await GameState.findById(req.params.gameId)
	console.log('db gameState pre card selection', gameState)
	// Apply game logic
})



module.exports = router;