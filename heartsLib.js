const deck = [
	"c2",
	"c3",
	"c4",
	"c5",
	"c6",
	"c7",
	"c8",
	"c9",
	"c10",
	"c11",
	"c12",
	"c13",
	"c14",
	"s2",
	"s3",
	"s4",
	"s5",
	"s6",
	"s7",
	"s8",
	"s9",
	"s10",
	"s11",
	"s12",
	"s13",
	"s14",
	"d2",
	"d3",
	"d4",
	"d5",
	"d6",
	"d7",
	"d8",
	"d9",
	"d10",
	"d11",
	"d12",
	"d13",
	"d14",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"h7",
	"h8",
	"h9",
	"h10",
	"h11",
	"h12",
	"h13",
	"h14",
];

const passMap = {
	turn: [
		{ player: [2, 3, 0, 1] },
		{ player: [3, 0, 1, 2] },
		{ player: [1, 2, 3, 0] },
		null,
	],
};

// * Shuffle and deal
//		Select a random card from the deck array, removing
//		that card.  Do so till deck is empty, distributing cards
//		sequentially to players
const dealHand = (gS, deck) => {
	// Reset hands
	gS.players.forEach((player) => (player.hand = []));

	for (let card = 0; card < 52; card++) {
		// Get random index based un-dealt deck size
		const i = randOfSize(52 - card);
		// Push to player hand and remove from deck
		gS.players[card % 4].hand.push({ id: deck[i], selected: false });
		deck.splice(i, 1);
	}

	console.log(
		"dealt ->",
		gS.players.map((p) => {
			return p.hand.map((c) => c.id + "-" + c.selected);
		})
	);
	console.log("deck is dealt, now sorting");

	//Sort Hands
	gS.players.map((p) => {
		p.hand.sort(compareCards);
	});

	//Reset general variables

	gS.turn = 0;
	gS.phase = "pass";
	gS.activePlayer = 0;
	gS.heartsBroken = false;
	gS.handNum = gS.handNum + 1;
	gS.trickNum = 1;
	// maxScore: 0,
	gS.firstPlayer = 0;
	// leader: 0,
	// winScore": 100,
	// playerOrder: [ 0, 1, 2, 3],
	gS.playedCards = [];

	return gS;
};

const trickCycle = (gS) => {
	// Entry points:
	//		newly dealt hand
	//		ai played card
	//		user played card
	//		passed cards

	// Exit points:
	//

	//
	// if activePlayer is computer, AIplayCard

	return gS;
};

const selectCard = (gS, user, clickedCardId) => {
	// Apply game logic
	const hand = gS.players[user].hand;
	const i = gS.players[user].hand.map((c) => c.id).indexOf(clickedCardId);
	const card = gS.players[user].hand[i];
	const phase = gS.phase;
	const passes = gS.players[user].passes;

	let message = "selected card:" + card.id;

	if (phase === "pass") {
		//Selection of three cards allowed
		if (passes.includes(clickedCardId)) {
			// Remove already selected card from passes and set to unselected in hand
			passes.splice(passes.indexOf(clickedCardId), 1);
			card.selected = false;
		} else if (passes.length === 3) {
			// Passes full
			// Remove oldest from passes, and deselect corresponding card
			hand[
				hand.map((c) => c.id).indexOf(passes.shift())
			].selected = false;
			// Add clicked card to passes and select
			passes.push(clickedCardId);
			card.selected = true;
		} else {
			// Freely select the card
			passes.push(clickedCardId);
			card.selected = true;
		}
	} else if (phase === "trick") {
		if (hand.filter((c) => c.selected).length === 3) {
			// if there are 3 selected,
			//		deselect all
			console.log("accepting passes");
			gS.players.map((p) =>
				p.hand.map((c) => {
					c.selected = false;
					return c;
				})
			);
			message = "accepted passed cards";
		} else if (card.selected) {
			// else if clicked card is already selected
			//		deselect clicked card
			card.selected = false;
			gS.players[user].passes = [];
			message = "de-selected " + card.id;
		} else {
			// else
			//		if isValid (clicked card)
			//			select clicked card
			//			deselect selected card

			// 1. reset all cards
			hand.map((c) => {
				c.selected = false;
				return c;
			});
			console.log("check validity of " + clickedCardId);
			if (isValid(user, clickedCardId, gS)) {
				console.log("Valid!");
				card.selected = true;
				gS.players[user].passes = [card.id];
			} else {
				console.log("Not Valid!");
			}
		}
	}

	console.log(
		" updated selection",
		gS.players[user].hand.map((c) => `${c.id} - ${c.selected}`)
	);

	return gS;
};

const compareCards = (a, b) => {
	if (a.id[0] === b.id[0]) {
		// compare values
		return parseInt(a.id.substr(1)) < parseInt(b.id.substr(1)) ? -1 : 1;
	} else {
		// compare suits
		const order = ["c", "d", "s", "h"];
		return order.indexOf(a.id[0]) < order.indexOf(b.id[0]) ? -1 : 1;
	}
};

const selectPlayerCard = (user, clickedCardId, gS) => {
	// Handle player selection of a card from their hand
	// Validity logic is game phase and state dependent

	const i = gS.players[user].hand.map((c) => c.id).indexOf(clickedCardId);
	const card = gS.players[user].hand[i];
	const passes = gS.players[user].passes;
	const hand = gS.players[user].hand;

	if (gS.phase === "pass") {
		// Pass phase
		// 		Allow up to three cards to be selected
		// 		Deselect oldest selected card if attempting to select a fourth
		// 		Deselect if card if already selected
		if (passes.includes(clickedCardId)) {
			// remove card from passes and set to unselected in hand
			passes.splice(passes.indexOf(clickedCardId));
			hand[i].selected = false;
		} else if (passes.length === 3) {
			// remove oldest entry from passes and set card to selected in hand
		} else {
			// add to passes and set card to selected in hand
		}
	} else if (gS.phase === "trick") {
		// Trick Phase
		// 		Allow up to one card to be selected
		// 		Must have same suit as led suit, unless hand does not include cards of led suit
		// 		If first card of trick, must be not hearts, unless hearts are broken
		console.log("selecting for trick" + clickedCardId);
	}
};

const isValid = (user, clickedCardId, gS) => {
	// Assesses validity of attempted selection
	// console.log(
	// 	"heartsLib - testing validity of " +
	// 		clickedCardId +
	// 		" from user " +
	// 		user
	// );

	if (parseInt(gS.activePlayer) !== parseInt(user)) {
		return false;
	}
	if (gS.playedCards.length === 0) {
		if (gS.trickNum === 1) {
			if (clickedCardId === "c2") {
				return true;
			} else {
				return false;
			}
		}
		if (clickedCardId === "c2") {
			return true;
		} else if (gS.heartsBroken) {
			return true;
		} else if (clickedCardId[0] !== "h") {
			return true;
		}
	} else {
		if (clickedCardId[0] === gS.playedCards[0][0]) {
			return true;
		} else if (
			gS.players[user].hand.filter(
				(c) => c.id[0] === gS.playedCards[0][0]
			).length === 0
		) {
			return true;
		} else {
			return false;
		}
	}
};

const randOfSize = (size) => Math.floor(Math.random() * size);

///////////////////////////////////////
// AI Functions
///////////////////////////////////////
// * AI pass card
//		Stub function - choose 3 random cards to pass

const selectAIPassCards = (gameState) => {
	// Check Hand number for passing status
	//   (pass turn 0, 1, 2, not 3, 4, 5, 6, not 7, etc)
	const protoHand = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
	if (gameState.handNum % 4 < 3) {
		for (let player = 0; player < 4; player++) {
			if (gameState.players[player].playerType === "computer") {
				let hand = [...protoHand];
				for (let i = 0; i < 3; i++) {
					// Remove an element from the protohand, using that primitive as an index
					let randIndex = hand.splice(randOfSize(hand.length), 1)[0];
					// Set the card at the index to be selected and ad it's id to the passes array
					gameState.players[player].passes.push(
						gameState.players[player].hand[randIndex].id
					);
					gameState.players[player].hand[randIndex].selected = true;
				}
				console.log(
					`player ${player} selects to pass:`,
					gameState.players[player].passes
				);
			}
		}
	}
	//  return updated gamestate w/ AI passes selected
	//	if no pass, returning original game state
	return gameState;
};

const AIplayCard = (gS, strategy) => {
	// let gS = gameState
	const p = gS.players[gS.activePlayer];
	const led = gS.playedCards.length === 0 ? null : gS.playedCards[0][0];
	// reset selections
	p.hand.map((c) => {
		c.selected = false;
		return c;
	});

	if (strategy === "random") {
		console.log(
			"picking random card for",
			gS.players[gS.activePlayer].name
		);
		// get set of card that would be valid plays
		const validCards = gS.players[gS.activePlayer].hand.filter((c) =>
			isValid(gS.activePlayer, c.id, gS)
		);
		console.log(
			"AI hand contains " +
				validCards.length +
				" valid cards of " +
				p.hand.length +
				" in hand"
		);

		// get ID of a random card from the valid plays
		const pickedCardId = validCards[randOfSize(validCards.length)].id;

		// get index of that card in the hand
		const pickedCardIndex = gS.players[gS.activePlayer].hand
			.map((c) => c.id)
			.indexOf(pickedCardId);

		// splice the random, valid card and push onto playedCards array
		console.log("prepush", p.hand[pickedCardIndex], gS.playedCards);
		gS.playedCards.push(...p.hand.splice(pickedCardIndex, 1));
		console.log("AI picked card", gS.playedCards);

		// if (led) {
		// 	// pick a card from led suit
		// 	console.log("    pick from " + led);
		// 	const ledArray = p.hand.filter((c) => c.id[0] === led);
		// 	const pickedId = ledArray[randOfSize(ledArray.length)].id;
		// 	gS.playedCards.push(
		// 		...p.hand.splice(p.hand.map((c) => c.id).indexOf(pickedId), 1)
		// 	);
		// } else {
		// 	// pick any card
		// 	console.log("    pick from any");
		// 	gS.playedCards.push(...p.hand.splice(randOfSize(p.hand.length), 1));
		// }
	}
	gS.activePlayer = (gS.activePlayer + 1) % 4;

	return gS;
};

module.exports = {
	deck,
	dealHand,
	passMap,
	selectAIPassCards,
	compareCards,
	AIplayCard,
	isValid,
	selectCard
};
