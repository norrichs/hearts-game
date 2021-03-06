const mongoose = require('../db/connection')
const  {Schema, model} = mongoose
const gameStateSchema = new Schema({
	turn : Number,
	phase: String,
	activePlayer: Number,
	heartsBroken: Boolean,
	handNum: Number,
	trickNum: Number,
	maxScore: Number,
	leader: Number,
	mainUser: Number,
	firstPlayer: Number,
	winScore: Number,
	playerOrder: [Number],
	playedCards: [{
		id: String,
		selected: Boolean
	}],		// Contains objects: {player: Number, card: String}
	players : [{
		name: String,
		playerType: String,	//'human' or 'computer'
		strategy: String, 	// named computer strategies - 'random', 'shooter', etc.  or 'human'
		position: Number,
		handScore: Number,
		gameScore: Number,
		hand: [{
			id: String,
			selected: Boolean
		}],
		passes: [String],
		receivedPass: [String],
		tricks: [{
			id: String,
			selected: Boolean
		}]
	}]
})

const GameState = model('GameState', gameStateSchema)

module.exports = GameState