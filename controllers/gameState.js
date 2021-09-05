const express = require("express");
const router = express.Router();
const GameState = require("../models/gamestate");
// Game init data
const gameStateInit = require("../db/seedGameState.json");
const moonShotInit = require("../db/moonshot.json");
// Hearts Game Library
const hearts = require("../heartsLib.js");

// Get Gamestate
//	TODO configure alt SHOW route if multiple games allowed on server e.g. leaderboard, etc





// INDEX route
router.get("/listGames/", async (req, res) => {
	let games = await GameState.find({})
	res.json({
		status: 200,
		data: games
	})
})

// RESET db
router.get("/clear/", async (req, res) => {
	let clear = await GameState.deleteMany({})
	res.json({
		status: 200,
		data: clear
	})
})


// SHOW route
router.get("/getState/:gameId", async (req, res) => {
	let gS = await GameState.findById(req.params.gameId);
	
	res.json({
		status: 200,
		data: gS,
	});
});

// Handles periodic polling by human players
// 	Progresses game by one step if polling player is main
//	Allows for step-wise progression through game, synced to single timing source
router.get("/pollState/:gameId/:user", async (req, res) => {
	let gS = await GameState.findById(req.params.gameId);

	// Trigger game progress if user is main user
	if (gS.mainUser == req.params.user) {
		console.log("**** getState - progress game");
		gS = hearts.gameCycle(gS);
		// sync new state to DB
		gS = await GameState.findByIdAndUpdate(req.params.gameId, gS, {
			new: true,
		});
	} else console.log("**** getState - polled");
	res.json({
		status: 200,
		data: gS,
	});
});

router.get("/updateGameState/:gameId/:user/:name/:mainUser", async (req, res) => {
	const {gameId, user, name, mainUser} = req.params
	let gS = await GameState.findById(gameId)
	if(mainUser === user) gS.mainUser = parseInt(user)
	gS.players[user].name = name
	gS.players[user].playerType = 'human'
	gS.players[user].strategy = 'human'
	gS = await GameState.findByIdAndUpdate(req.params.gameId, gS, {new: true})
	res.json({
		status: 200,
		data: gS
	})
})

// get current state and initialize card passing logic
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
	res.json({
		status: 200,
		data: gS,
	});
});

// Initialize Game Instance
router.get("/seed", async (req, res) => {
	console.log("initializing game");
	try {
		const gameState = await GameState.create(gameStateInit);
		res.json({
			status: 200,
			msg: "game initialized",
			data: gameState,
		});
	} catch (error) {
		console.log("seed error", error);
		res.status(400).json(error);
	}
});

// Deal Hand
router.get("/deal/:gameId", async (req, res) => {
	let gS = await GameState.findById(req.params.gameId);
	console.log("state", gS);
	// Deal random cards to each player hand
	gS = hearts.dealHand(gS, [...hearts.deck]);
	// Write dealt hand to database
	gS = await GameState.findByIdAndUpdate(req.params.gameId, gS, {
		new: true,
	});
	res.json({
		status: 200,
		data: gS,
	});
});

// Deal a non-random hand for debugging purposes
router.get("/debug/:gameId/:statefile", async (req, res) => {

	let gS = {}
	switch (req.params.statefile) {
		case "moonshot":
			gS = moonShotInit;
			break;
		case "endhand":
			gS = endHandInit
			break;
	}
	gS = await GameState.findByIdAndUpdate(req.params.gameId, gS, {
		new: true,
	});
	res.json({
		status: 200,
		data: gS,
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
