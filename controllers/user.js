const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

const userInit = require("../db/seedUser.json");
const moonShotInit = require("../db/moonshot.json");

// INDEX route
router.get("/listUsers/", async (req, res) => {
	let users = await User.find({});
	res.json({
		status: 200,
		data: users,
	});
});
// RESET db
router.get("/clear/", async (req, res) => {
	let clear = await User.deleteMany({});
	res.json({
		status: 200,
		data: clear,
	});
});

// Check Username and Password
router.get("/check/:username/:password", async (req, res) => {
	let response = {
		status: 200,
		message: "",
		data: "",
	};
	let matching = await User.find({ username: req.params.username });
	if (matching.length === 1) {
		matching = matching[0]._doc
		const {password, ...userParams} = matching;
		console.log(
			"matching: ",
			req.params.password,
			" to:",
			password,
			"matching",
			userParams
		);
		const isCorrect = await bcrypt.compare(
			req.params.password,
			password
		);
		console.log(isCorrect);

		if (isCorrect) {
			response.message = "passed";
			response.data = userParams
		} else {
			response.message = "failed";
		}
	} else if (matching.length === 0) {
		response.message = "new";
	} else {
		response.message = "duplicates";
	}
	console.log("response", response);
	res.json(response);
});

// Create new user
router.get("/newUser/:username/:password", async (req, res) => {
	const rounds = 10;
	const result = {
		status: 200,
		data: null,
	};
	const hashedPassword = await bcrypt.hash(req.params.password, rounds);
	console.log("hashed password", hashedPassword);
	let newUser = userInit;
	newUser.username = req.params.username;
	newUser.password = hashedPassword;
	newUser = await User.create(newUser);
	const { password, ...rest } = newUser._doc;
	result.data = rest;
	res.json(result);
});

// Handles periodic polling by human players
// 	Progresses game by one step if polling player is main
//	Allows for step-wise progression through game, synced to single timing source
// router.get("/getState/:gameId/:user", async (req, res) => {
// 	let gS = await User.findById(req.params.gameId);

// 	// Trigger game progress if user is main user
// 	if (gS.mainUser == req.params.user) {
// 		console.log("**** getState - progress game");
// 		gS = hearts.gameCycle(gS);
// 		// sync new state to DB
// 		gS = await User.findByIdAndUpdate(req.params.gameId, gS, {
// 			new: true,
// 		});
// 	} else console.log("**** getState - polled");
// 	res.json({
// 		status: 200,
// 		data: gS,
// 	});
// });

// router.get("/updateUser/:gameId/:user/:name/:mainUser", async (req, res) => {
// 	const {gameId, user, name, mainUser} = req.params
// 	let gS = await User.findById(gameId)
// 	if(mainUser === user) gS.mainUser = parseInt(user)
// 	gS.players[user].name = name
// 	gS.players[user].playerType = 'human'
// 	gS.players[user].strategy = 'human'
// 	gS = await User.findByIdAndUpdate(req.params.gameId, gS, {new: true})
// 	res.json({
// 		status: 200,
// 		data: gS
// 	})
// })

// Initialize Game Instance
router.get("/seed", async (req, res) => {
	console.log("initializing game");
	try {
		const user = await User.create(userInit);
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

module.exports = router;
