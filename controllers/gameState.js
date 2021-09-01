const express = require("express");
const router = express.Router();
const GameState = require("../models/gamestate");
// Game init data
const gameStateInit = require("../db/seedGameState.json");
// Hearts Game Library
const hearts = require("../heartsLib.js");

// Get Gamestate
//	TODO configure alt SHOW route if multiple games allowed on server e.g. leaderboard, etc

// Handles periodic polling by human players
// 	Progresses game by one step if polling player is main 
//	Allows for step-wise progression through game, synced to single timing source

router.get("/getState/:gameId/:user", async (req, res) => {
	let gS = await GameState.findById(req.params.gameId);

	// Trigger game progress if user is main user
	if (gS.mainUser == req.params.user){
		console.log('**** getState - progress game')
		gS = hearts.gameCycle(gS)
		// sync new state to DB
		gS = await GameState.findByIdAndUpdate(req.params.gameId, gS, {
			new: true,
		});
	}else console.log('**** getState - polled')
	res.json({
		status: 200,
		data: gS,
	});
});

router.get("/passCards/:gameId", async (req, res) => {
	console.log("passCards route");
	// Sync current gameState
	let gS = await GameState.findById(req.params.gameId);
	// Evaluate selected passes
	gS = hearts.evalPass(gS);
	// Sync database
	gS = await GameState.findByIdAndUpdate(req.params.gameId, gS, {
		new: true,
	});
	res.json({
		status: 200,
		data: gS,
	});
});

// Play user's selected card
router.get("/playCard/:gameId/:user", async (req, res) => {
	// Get current gameState
	let gS = await GameState.findById(req.params.gameId);
	// pass the selected card into playCards array
	hearts.userPlayCard(gS, req.params.user);
	// Sync database with current changes related to playing card
	gS = await GameState.findByIdAndUpdate(req.params.gameId, gS, {
		new: true,
	});
	console.log(
		"  playCard: newly played cards" +
		gS.playedCards +
		"pass queue" +
		gS.players[req.params.user].passes
	);
	res.json({
		status: 200,
		data: gS,
	});
});

// Initialize Game Instance
router.get("/seed", async (req, res) => {
	console.log("initializing game");
	try{
		const gameState = await GameState.create(gameStateInit);
		res.json({
			status: 200,
			msg: "game initialized",
			data: gameState,
		});
	}catch(error){
		res.status(400).json(error)
	}
});

// Deal Hand
// TODO separate deal and AIselect functions
// REFACTOR so that dealHand responds without AIselect
//		frontend will need to receive the response and then bounce back a request
//		to "take next step" -> gameCycle method?
router.get("/deal/:gameId", async (req, res) => {
	let gameState = await GameState.findById(req.params.gameId);
	console.log("state", gameState);
	// Deal random cards to each player hand
	gameState = hearts.dealHand(gameState, [...hearts.deck]);

	// TODO transfer this functionality to be directed by gameCycle
	// Select cards to pass for all computer players
	// gameState = hearts.AISelectPassCards(gameState);
	
	// Write dealt and pass-selected game state to DB and respond with up-to-date state
	gameState = await GameState.findByIdAndUpdate(
		req.params.gameId,
		gameState,
		{
			new: true,
		}
	);
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

	gS = hearts.selectCard(gS, user, clickedCardId);

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
