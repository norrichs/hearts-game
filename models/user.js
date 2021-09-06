const { isValidObjectId } = require('mongoose')
const mongoose = require('../db/connection')
const  {Schema, model} = mongoose
const userSchema = new Schema({
	username: String,
	password: String,
	playerNumber: Number,
	gameId: String,
	winCount: 0
})

const User = model('User', userSchema)

module.exports = User