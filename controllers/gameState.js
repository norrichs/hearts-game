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

// Get GamesListing
// router.get("/", async (req, res) => {
// 	const allGameStates = await GameState.find({});
// 	res.json({
// 		status: 200,
// 		data: allGameStates,
// 	});
// });

// Set GameState
// router.put("/setState/:id", async (req, res) => {
// 	const gameState = await GameState.findByIdAndUpdate(
// 		req.params.id,
// 		req.body,
// 		{ new: true }
// 	);
// 	res.json({
// 		status: 200,
// 		data: gameState,
// 	});
// });

// Reset Game states

// when called, this route handles the exchange of cards between players
// TODO - offload the logic of this route to a library function so it can be called by the AI card selection route

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

// TODO refactor this route to transfer game logic to heartsLib.js
router.get("/passCards/:id", async (req, res) => {
	console.log("passCards route");

	let gS = await GameState.findById(req.params.id);
	gS.players.forEach((player) => {
		console.log(player.name, "passes", player.passes, "hand", player.hand);
	});

	// Check if all players have selected passes, handle exchanges if so.
	let passCardsTotal = 0;
	gS.players.forEach((player) => {
		passCardsTotal += player.passes.length;
	});
	if (passCardsTotal === 12) {
		// pass cards appropriately
		const t = gS.turn;
		gS.players = gS.players.map((player, i) => {
			// for each player, move records from donor hand to recipient hand, setting all new cards to 'selected'
			// console.log('pre-pass', player.hand)
			console.log("passing to " + player.name);
			const from = hearts.passMap.turn[t].player[i];

			gS.players[from].passes.forEach((id) => {
				const srcIndex = gS.players[from].hand
					.map((c) => c.id)
					.indexOf(id);
				const passingCard = gS.players[from].hand.splice(
					srcIndex,
					1
				)[0];
				console.log(
					"  passing:",
					passingCard,
					" from: ",
					gS.players[from].name,
					" to:",
					player.name
				);
				passingCard.selected = true;
				player.hand.push(passingCard);
			});

			// console.log('post-pass'gS.players[from].hand.splice(srcIndex,1), player.hand)
			player.hand.sort(hearts.compareCards);

			return player;
		});
		gS.phase = "trick";
		
		// Set active player
		gS.players.forEach((player, i) => {
			player.passes = [];
			console.log('   passCards hand map', player.hand.map((c) => c.id), 'includes', player.hand.map((c) => c.id).includes("c2"))
			if (player.hand.map((c) => c.id).includes("c2")){
				gS.activePlayer = i;
				gS.firstPlayer = i;
				console.log('   passCards set active player', gS.activePlayer, 'first', gS.firstPlayer)
			}
		});

		// Loop through any computer players and pick a card to play
		while (gS.players[gS.activePlayer].playerType === "computer") {
			console.log('go to AIplayCard for', gS.activePlayer)
			gS = hearts.AIplayCard(gS, 'random');
		}
	}
	gS = await GameState.findByIdAndUpdate(req.params.id, gS, {
		new: true,
	});
	// console.log(
	// 	"player hands",
	// 	gS.players[0].hand,
	// 	gS.players[1].hand,
	// 	gS.players[2].hand,
	// 	gS.players[3].hand
	// );
	res.json({
		status: 200,
		data: gS,
	});
});

// TODO refactor this route to transfer game logic to heartsLib.js
router.get("/playCard/:id/:user", async (req, res) => {
	console.log('Playing card from user', req.params.user)

	let gS = await GameState.findById(req.params.id);
	const hand = gS.players[req.params.user].hand
	const passes = gS.players[req.params.user].passes
	console.log('playCard pass queue', passes)
	// Splice selected card from hand and push to playedCards
	gS.playedCards.push(...hand.splice(hand.map(c=>c.id).indexOf(passes[0]), 1))
	gS.players[req.params.user].passes = []
	// console.log('pre update', gS.playedCards)

	// Set up next action
	if(gS.playedCards.length === 4){
		gS = hearts.evalTrick(gS)
	}else{
		gS.activePlayer = (gS.activePlayer + 1) % 4
		console.log('AIplayCard updated activePlayer', gS.activePlayer)
		gS = hearts.AIplayCard(gS, 'random')
	}

	gS = await GameState.findByIdAndUpdate(req.params.id, gS, {
		new: true
	})
	console.log('newly played cards', gS.playedCards, 'pass queue', gS.players[req.params.user].passes)
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
