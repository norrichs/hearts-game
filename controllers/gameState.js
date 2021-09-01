const express = require("express");
const router = express.Router();
const GameState = require("../models/gamestate");
// Game init data
const gameStateInit = require("../db/seedGameState.json");
// Hearts Game Library
const hearts = require("../heartsLib.js");

// Get Gamestate
//	TODO configure alt SHOW route if multiple games allowed on server e.g. leaderboard, etc
router.get("/getState/:id", async (req, res) => {
	const gameState = await GameState.findById(req.params.id);
	res.json({
		status: 200,
		data: gameState,
	});
});

// TODO
//	1 Set active player at end of pass-cycle
//  2 Set active player at end of trick

// router.get("/passCards/:id", async (req,res)=>{
// 	console.log('hit pass cards route stub')
// 	res.json({
// 		status: 200,
// 		msg: 'blank'
// 	})
// })


router.get("/passCards/:id", async (req, res) => {
	console.log("passCards route");
	// Sync current gameState
	let gS = await GameState.findById(req.params.id);
	// Evaluate selected passes
	gS = hearts.evalPass(gS)
	// Sync database
	gS = await GameState.findByIdAndUpdate(req.params.id, gS, {
		new: true,
	});
	res.json({
		status: 200,
		data: gS,
	});
});

// TODO refactor this route to transfer game logic to heartsLib.js
router.get("/playCard/:id/:user", async (req, res) => {
	// console.log('Playing card from user', req.params.user)
	console.time('playCard')
	let gS = await GameState.findById(req.params.id);
	const hand = gS.players[req.params.user].hand
	const passes = gS.players[req.params.user].passes
	// console.log('playCard pass queue', passes)
	// Splice selected card from hand and push to playedCards
	gS.playedCards.push(...hand.splice(hand.map(c=>c.id).indexOf(passes[0]), 1))
	gS.players[req.params.user].passes = []
	// console.log('pre update', gS.playedCards)

	// Set up next action
	if(gS.playedCards.length === 4){
		console.log('played 4, time to eval')
		gS = hearts.evalTrick(gS)
	}else{
		console.log('time to do some AI players')
		gS.activePlayer = (gS.activePlayer + 1) % 4
		// console.log('/playCard/ calling AIplayCycle for player: ', gS.activePlayer)
		gS = hearts.AIplayCycle(gS, 'random')
		console.log('AI cycle complete.  current active player', gS.activePlayer)
	}
	gS = await GameState.findByIdAndUpdate(req.params.id, gS, {
		new: true
	})
	console.log('newly played cards', gS.playedCards, 'pass queue', gS.players[req.params.user].passes)
	console.timeEnd('playCard')
	res.json({
		status: 200,
		data: gS,
	});
});





// Initialize Game Instance
router.get("/seed", async (req, res) => {
	console.log("initializing game");
	const gameState = await GameState.create(gameStateInit);
	res.json({
		status: 200,
		msg: "game initialized",
		data: gameState,
	});
});

// Deal Hand
router.get("/deal/:id", async (req, res) => {
	let gameState = await GameState.findById(req.params.id);
	console.log("state", gameState);
	// Deal random cards to each player hand
	gameState = hearts.dealHand(gameState, [...hearts.deck]);

	// Select cards to pass for all computer players
	gameState = hearts.selectAIPassCards(gameState);

	// Write dealt and pass-selected game state to DB and respond with up-to-date state
	gameState = await GameState.findByIdAndUpdate(req.params.id, gameState, {
		new: true,
	});
	res.json({
		status: 200,
		data: gameState,
	});
});

// Resolve a card selection in player's hand
router.get("/selectCard/:gameId/:user/:clickedCardId", async (req, res) => {
	const { gameId, user, clickedCardId } = req.params;
	// console.log("select card router parameters", req.params);
	let gS = await GameState.findById(gameId);
	// console.log("db gameState pre card selection", gS);

	gS = hearts.selectCard(gS, user, clickedCardId)

	// UPDATE database and respond with results
	gS = await GameState.findByIdAndUpdate(gameId, gS, {
		new: true,
	});
	res.json({
		status: 200,
		data: gS,
	});
});

module.exports = router;
