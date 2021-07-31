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
	console.log('deck', hearts.deck)
	console.log('state', gameState)
	gameState = hearts.dealGame(gameState, [...hearts.deck])
	gameState = await GameState.findByIdAndUpdate(req.params.id, gameState, {new: true})
	res.json({
		status: 200,
		data: gameState
	}) 
})

// AI pass cards
router.get("/passAi/:id", async (req, res) => {
	let gameState = await GameState.findById(req.params.id)
	console.log('got gamestate')
	for(let player = 0; player < 4; player++){
		console.log(gameState.players[player].playerType)
		if(gameState.players[player].playerType === 'computer'){
			for(let i=0; i<3; i++){
				let randIndex = Math.floor( Math.random() * gameState.players[player].hand.length)
				gameState.players[player].passes.push(gameState.players[player].hand[randIndex])
				gameState.players[player].hand.splice(randIndex,1)
			}
			console.log(`player ${player} passes:`,gameState.players[player].passes)
		}
	}





	// gameState.players = gameState.players.map((player)=>{
	// 	if(player.playerType === "computer"){
	// 		const hand = [...player.hand]
	// 		for(let j=0; j<3; j++){
	// 			console.log('picking for', i,player.playerType)
	// 			let randIndex = Math.floor( Math.random * hand.length)
	// 			player.passes.push(hand[randIndex])
	// 			hand.splice(randIndex,1)
	// 		}
	// 	}
	// 	player.hand = [...hand]
	// 	return player
	// })
	gameState = await GameState.findByIdAndUpdate(req.params.id, gameState, {new: true})
	res.json({
		status: 200,
		data: gameState
	})
})




module.exports = router;