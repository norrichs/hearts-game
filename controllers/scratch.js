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
			if (player.hand.map((c) => c.id).includes("c2"))
				gS.activePlayer = i;
		});

		// T
		if (gS.players[gS.activePlayer].playerType === "computer") {
			hearts.pickCard(gS, gS.activePlayer, "random");
		}
	}
	gS = await GameState.findByIdAndUpdate(req.params.id, gS, {
		new: true,
	});
	console.log(
		"player hands",
		gS.players[0].hand,
		gS.players[1].hand,
		gS.players[2].hand,
		gS.players[3].hand
	);
	res.json({
		status: 200,
		data: gS,
	});
});
