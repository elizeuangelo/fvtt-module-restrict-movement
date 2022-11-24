import { NAME, turnOrder, getJournal } from './settings.js';

export function getSceneControlButtons(controls) {
	if (!game.user.isGM) return;
	controls
		.find((c) => c.name === 'token')
		.tools.push({
			name: 'dungeon-mode',
			title: 'Dungeon Mode',
			icon: 'fas fa-dungeon',
			active: game.settings.get(NAME, 'movement-restricted'),
			toggle: true,
			onClick: (active) => {
				game.settings.set(NAME, 'movement-restricted', active);
				if (active) {
					ui.notifications.notify('Dungeon Mode is now active, players movements are restricted');
					game.settings.set(NAME, 'counter', game.settings.get(NAME, 'counter') + 1);
				} else ui.notifications.notify('Dungeon Mode is now inactive, players can move freely');
			},
		});
}

const twist = new MersenneTwister(0);

function shuffleArray(array) {
	twist.seed(game.settings.get(NAME, 'counter'));

	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(twist.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

function getAllRestrictedTokens() {
	return shuffleArray(canvas.tokens.placeables.filter((t) => t.document.hasPlayerOwner).sort((a, b) => 1 - 2 * (a.id > b.id)));
}

function currentToken(restrictedTokens = getAllRestrictedTokens()) {
	if (!game.combat) {
		const turn = turnOrder() % restrictedTokens.length;
		return restrictedTokens[turn];
	}
	return game.combat.combatant.token;
}

function allowMovement(token) {
	if (!game.settings.get(NAME, 'movement-restricted') || game.user.isGM) return true;
	const restrictedTokens = getAllRestrictedTokens();
	if (game.combat) return game.combat.current.tokenId === token.id;
	return currentToken(restrictedTokens).id === token.id;
}

const oldCanDrag = Token.prototype._canDrag;
function canDrag(...args) {
	if (!allowMovement(this)) return false;
	return oldCanDrag.bind(this)(...args);
}

Token.prototype._canDrag = canDrag;

export function preUpdateToken(document, update) {
	if ((update.x != undefined || update.y != undefined) && !game.user.isGM) {
		if (!allowMovement(document)) {
			delete update.x;
			delete update.y;
			ui.notifications.warn("Token can't be moved out of turn order");
		}
	}
}

function passTurn() {
	const t = currentToken();
	if (!game.settings.get(NAME, 'movement-restricted')) {
		ui.notifications.notify('Movement is not restricted');
		return;
	}
	if (t.isOwner && allowMovement(t)) {
		getJournal().setFlag(NAME, 'order', turnOrder() + 1);
		ui.notifications.notify('Turn passed');
		game.combat?.nextTurn();
	} else ui.notifications.error('Its not your turn to pass');
}

export function createApi() {
	game.modules.get(NAME).api = { passTurn };
}
