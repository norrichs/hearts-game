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
			console.log(
				"check validity of " + clickedCardId,
				"in hand of ",
				gS.players[user]
			);
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

// Transfers user-selected card to playedCards array
// TODO - REFACTOR - move evalTrick and AIplayCycle calls out of function
// 		trigger by poll-call from 'main' user

const userPlayCard = (gS, user) => {
	const hand = gS.players[user].hand;
	const passes = gS.players[user].passes;
	// Splice selected card from hand and push to playedCards
	gS.playedCards.push(
		...hand.splice(hand.map((c) => c.id).indexOf(passes[0]), 1)
	);
	gS.players[user].passes = [];
	// console.log('pre update', gS.playedCards)

	// Set up next action
	if (gS.playedCards.length === 4) {
		console.log("played 4, time to eval");
		gS = evalTrick(gS);
	} else {
		console.log("time to do some AI players");
		gS.activePlayer = (gS.activePlayer + 1) % 4;
		// console.log('/playCard/ calling AIplayCycle for player: ', gS.activePlayer)
		gS = AIplayCycle(gS, "random");
		console.log(
			"AI cycle complete.  current active player",
			gS.activePlayer
		);
	}

	return gS;
};

const scoreTricks = (trickArray) => {
	// given an array of tricks, return 1pt per heart and 13pts for the queen of spades

	// console.log("      scoreTricks array", trickArray);
	return (
		trickArray.filter((c) => c.id[0] === "h").length +
		(trickArray.map((c) => c.id).includes("s12") ? 13 : 0)
	);
};

const isMoonShot = (gS) => {
	// console.log(
	// 	"isMoonShot tricks",
	// 	gS.players.map((p) => p.tricks)
	// );
	const scoreArray = gS.players.map((p) => {
		return scoreTricks(p.tricks);
	});
	return scoreArray.indexOf(26) === -1 ? false : scoreArray.indexOf(26);
};
// Triggered by frontend, evaluates gamestate to exchange
// 	cards per passing map
//
const evalPass = (gS) => {
	console.log("evalPass hand #", gS.handNum);
	// Check if all players have selected passes, handle exchanges if so.
	let passCardsTotal = gS.players.reduce((acc, p) => {
		return (acc += p.passes.length);
	}, 0);
	if (passCardsTotal === 12) {
		// pass cards appropriately
		const t = gS.turn;
		gS.players = gS.players.map((recipient, i) => {
			// for each player, move records from donor hand to recipient hand, setting all new cards to 'selected'
			const donor = gS.players[passMap.turn[t].player[i]];

			donor.passes.forEach((id) => {
				const srcIndex = donor.hand.map((c) => c.id).indexOf(id);
				const passingCard = donor.hand.splice(srcIndex, 1)[0];
				console.log(
					"  passing:",
					passingCard,
					donor.name,
					"->",
					recipient.name
				);
				passingCard.selected = true;
				recipient.hand.push(passingCard);
			});
			recipient.hand.sort(compareCards);

			return recipient;
		});
		gS.phase = "trick";

		// Set active player
		gS.players.forEach((player, i) => {
			player.passes = [];
			// console.log('   passCards hand map', player.hand.map((c) => c.id), 'includes', player.hand.map((c) => c.id).includes("c2"))
			if (player.hand.map((c) => c.id).includes("c2")) {
				gS.activePlayer = i;
				gS.firstPlayer = i;
				console.log(
					"   evalPass set active player",
					gS.activePlayer,
					"first",
					gS.firstPlayer
				);
			}
		});

		// Loop through any computer players and pick a card to play
		if (gS.players[gS.activePlayer].playerType === "computer") {
			console.log(
				"/passCards/ calling AIplayCycle for player: ",
				gS.activePlayer
			);
			gS = AIplayCycle(gS, "random");
			console.log(
				"AI cycle complete.  current active player",
				gS.activePlayer
			);
		}
	}
	return gS;
};

const evalTrick = (gS) => {
	console.log("user state at evaltricks", gS.players[0]);
	const led = gS.playedCards[0].id[0];
	//  winning card is highest of led suit
	console.log(
		"led: " + led,
		"filtered and mapped played cards",
		gS.playedCards
			.filter((c) => c.id[0] === led)
			.map((c) => parseInt(c.id.substr(1))),
		"topvalue",
		Math.max(
			...gS.playedCards
				.filter((c) => c.id[0] === led)
				.map((c) => parseInt(c.id.substr(1)))
		)
	);
	const topCard =
		led +
		Math.max(
			...gS.playedCards
				.filter((c) => c.id[0] === led)
				.map((c) => parseInt(c.id.substr(1)))
		);

	console.log("current played cards", gS.playedCards);
	console.log("	eval top card", topCard);
	const winner =
		(gS.firstPlayer + gS.playedCards.map((c) => c.id).indexOf(topCard)) % 4;

	console.log(
		"winner",
		winner,
		"current tricks",
		gS.players[winner].tricks.length
	);

	// Move played cards to winner's tricks array
	gS.players[winner].tricks = [
		...gS.players[winner].tricks,
		...gS.playedCards,
	];

	console.log(
		"****  winner: ",
		gS.players[winner].name,
		"with card",
		topCard,
		"current tricks",
		gS.players[winner].tricks
	);

	// Check for moon shot
	let moonShotWinner = isMoonShot(gS);
	if (moonShotWinner) {
		console.log("****  " + moonShotWinner + " shot the moon");
		// update state
		// check game win condition
		// deal new hand
	} else {
		// Update winning player
		const trickScore = gS.playedCards.filter((c) => c.id[0] === "h");
		gS.players[winner].handScore += trickScore;
		// gS.players[winner].gameScore += trickScore;
		gS.players[winner].passes = [];

		// Update other players
		gS.players
			.filter((p, i) => i !== winner)
			.map((p) => {
				p.handScore = scoreTricks(p.tricks);
				p.passes = [];
			});

		// Reset general gamestate for next trick and set activePlayer
		gS.turn = 0;
		gS.phase = "trick";
		gS.activePlayer = winner;
		// gS.heartsBroken
		// gS.handNum
		gS.trickNum = gS.trickNum + 1;
		(gS.maxScore = Math.max(gS.players.map((p) => parseInt(p.gameScore)))),
			(gS.firstPlayer = winner);
		// leader: 0,
		// winScore": 100,
		// playerOrder: [ 0, 1, 2, 3],
		gS.playedCards = [];
		gS.players.forEach((p) => {});
	}
	// console.log("****  evalTrick return state", gS);
	return gS;
};

const isValid = (user, clickedCardId, gS) => {
	// Assesses validity of attempted selection
	// Validity pseudocode
	{
		// IF activePlayer is not user 		//false , only select when turn
		// IF no played cards
		// 	IF trick number === 1
		// 		IF selection is c2			//true
		// 		ELSE						//false
		// 	ELSEIF heartsbroken				//true
		// 	ELSEIF selection.suit != hearts	//true
		// ELSE
		// 	IF selection.suit === led suit	//true
		// 	ELSEIF no cards in hand of led  //true
		// 	ELSE							//false
	}

	if (parseInt(gS.activePlayer) !== parseInt(user)) {
		return false;
	}
	if (gS.playedCards.length === 0) {
		// console.log("leading");
		if (gS.trickNum === 1) {
			if (clickedCardId === "c2") return true;
			else return false;
		} else if (gS.heartsBroken) return true;
		else if (clickedCardId[0] !== "h") return true;
	} else {
		// console.log("following");
		if (clickedCardId[0] === gS.playedCards[0].id[0]) return true;
		else if (
			gS.players[user].hand.filter(
				(c) => c.id[0] === gS.playedCards[0].id[0]
			).length === 0
		) {
			console.log(
				"played, filtered user hand",
				gS.playedCards,
				gS.players[user].hand.filter(
					(c) => c.id[0] === gS.playedCards[0].id[0]
				)
			);
			return true;
		} else return false;
	}
};

const randOfSize = (size) => Math.floor(Math.random() * size);

///////////////////////////////////////
// AI Functions
///////////////////////////////////////
// * AI pass card
//		Stub function - choose 3 random cards to pass

const AISelectPassCards = (gS) => {
	// Check Hand number for passing status
	//   (pass turn 0, 1, 2, not 3, 4, 5, 6, not 7, etc)
	const protoHand = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
	const limit = 1;
	let counter = 0;

	if (gS.handNum % 4 < 3) {
		// TODO refactor to use named 'donor', and only do one per function
		gS.players.map((donor) => {
			if (donor.playerType === "computer" && donor.passes.length === 0) {
				if (counter < limit) {
					counter += 1;
					let hand = [...protoHand];
					for (let i = 0; i < 3; i++) {
						// Remove an element from the protohand, using that primitive as an index
						let randIndex = hand.splice(
							randOfSize(hand.length),
							1
						)[0];
						// Set the card at the index to be selected and ad it's id to the passes array
						donor.passes.push(donor.hand[randIndex].id);
						donor.hand[randIndex].selected = true;
					}
					console.log(
						`    - AIselectPassCards - ${donor.name} new passes:${donor.passes}`
					);
				} else
					console.log(
						`    - AIselectPassCards - ${donor.name} old passes:${donor.passes}`
					);
			} else
				console.log(
					`    - AIselectPassCards - ${donor.name} ${
						donor.playerType === "human"
							? "human pass " + donor.passes
							: "old passes " + donor.passes
					}`
				);

			return donor;
		});
	}
	//  return updated gamestate w/ a single AI passes selected
	//	if no pass, returning original game state
	return gS;
};

const AIplayCycle = (gS) => {
	let activePlayer = gS.players[gS.activePlayer];
	let activePlayerType = activePlayer.playerType;
	let strategy = activePlayer.strategy;
	while (activePlayerType === "computer") {
		console.log("  AIplayCycle: picking card for", activePlayer.name);
		gS = AIplayCard(gS, strategy);
		if (gS.playedCards.length === 4) {
			console.log("time to eval");
			gS = evalTrick(gS);
			// reset game state
			// check for active player
			// continue cycle if not waiting for user
			// else return
		} else {
			gS.activePlayer = (gS.activePlayer + 1) % 4; // TODO adjust so that active player is trick taker
			activePlayer = gS.players[gS.activePlayer];
			activePlayerType = activePlayer.playerType;
			strategy = activePlayer.strategy;
			console.log(
				"AIplayCycle type",
				activePlayerType,
				"player",
				activePlayer
			);
		}
	}
	return gS;
};

const AIplayCard = (gS, strategy) => {
	// let gS = gameState
	const p = gS.players[gS.activePlayer];
	// reset selections
	p.hand = p.hand.map((c) => {
		c.selected = false;
		return c;
	});

	if (strategy === "random") {
		// console.log(
		// 	"    picking random card for"+ p.name + 'hand', p.hand.map(c=>c.id)
		// );
		// get set of card that would be valid plays
		const validCards = gS.players[gS.activePlayer].hand.filter((c) =>
			isValid(gS.activePlayer, c.id, gS)
		);
		// get ID of a random card from the valid plays
		let pickedCardId;
		try {
			pickedCardId = validCards[randOfSize(validCards.length)].id;
		} catch {
			console.log(
				"failed to pick card from valid",
				validCards,
				"with hand",
				gS.players[gS.activePlayer].hand,
				"for player",
				gS.activePlayer
			);
		}

		// get index of that card in the hand
		const pickedCardIndex = gS.players[gS.activePlayer].hand
			.map((c) => c.id)
			.indexOf(pickedCardId);

		// splice the random, valid card and push onto playedCards array

		// console.log('    valid cards', validCards, 'picked card', p.hand[pickedCardIndex])
		gS.playedCards.push(...p.hand.splice(pickedCardIndex, 1));

		// console.log('    current playCards', gS.playedCards)
	}

	return gS;
};

// TODO - transfer all 'sequential game steps' to only be called from this function, which will act as 'traffic director'
// TODO - implement with very minimal game-logic in-function (push out to helper functions)
const gameCycle = (gS) => {
	console.log(" - gameCycle");
	// Traffic control
	if (gS.phase === "pass") {
		// 	PASSES
		console.log("   - pass");
		gS = AISelectPassCards(gS);
	} else if (gS.phase === "trick") {
		//	PLAYS - each time pick card for next computer player
		console.log("   - trick");
	} else {
		//  EVAL trick
		console.log("   - eval?");
	}

	return gS;
};

module.exports = {
	deck,
	dealHand,
	passMap,
	compareCards,
	isValid,
	evalTrick,
	evalPass,
	selectCard,
	userPlayCard,
	AISelectPassCards,
	AIplayCard,
	AIplayCycle,
	gameCycle,
};
