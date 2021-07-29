const mongoose = require('../db/connection')
const  {Schema, model} = mongoose
const gameStateSchema = new Schema({
	turn : { type: Number },
	heartsBroken: Boolean,
	handNum: Number,
	winScore: Number,
	playerOrder: [Number],
	playedCards: [String],		// Contains objects: {player: Number, card: String}
	players : [{
		name: String,
		playerType: String,
		position: Number,
		handScore: Number,
		gameScore: Number,
		selectedCard: String,
		hand: [String],
		receivedPass: [String],
		tricks: [String]
	}]
})

const GameState = model('GameState', gameStateSchema)

module.exports = GameState