const express = require("express");
const router = express.Router();
const GameState = require("../models/gamestate");
// Game init data
const gameStateInit = require("../db/seedGameState.json");
// Hearts Game Library
const hearts = require("../heartsLib.js");

// Get Gamestate
//	TODO configure alt SHOW route if multiple games allowed on server e.g. leaderboard, etc
router.get("/getState/:gameId", async (req, res) => {
	const gameState = await GameState.findById(req.params.gameId);
	res.json({
		status: 200,
		data: gameState,
	});
});

// TODO
//	1 Set active player at end of pass-cycle
//  2 Set active player at end of trick

// router.get("/passCards/:gameId", async (req,res)=>{
// 	console.log('hit pass cards route stub')
// 	res.json({
// 		status: 200,
// 		msg: 'blank'
// 	})
// })

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

// TODO refactor this route to transfer game logic to heartsLib.js
router.get("/playCard/:gameId/:user", async (req, res) => {
	// console.log('Playing card from user', req.params.user)
	console.time("playCard");
	// Get current gameState
	let gS = await GameState.findById(req.params.gameId);

	hearts.userPlayCard(gS, req.params.user);

	// Sync database with current changes related to playing card
	gS = await GameState.findByIdAndUpdate(req.params.gameId, gS, {
		new: true,
	});
	console.log(
		"newly played cards",
		gS.playedCards,
		"pass queue",
		gS.players[req.params.user].passes
	);
	console.timeEnd("playCard");

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
router.get("/deal/:gameId", async (req, res) => {
	let gameState = await GameState.findById(req.params.gameId);
	console.log("state", gameState);
	// Deal random cards to each player hand
	gameState = hearts.dealHand(gameState, [...hearts.deck]);

	// Select cards to pass for all computer players
	gameState = hearts.AISelectPassCards(gameState);

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
