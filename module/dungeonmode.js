import { NAME, turnOrder, getJournal, movementRestricted } from './settings.js';
import { removeMarks, applyMarks } from './turnmarks.js';

export function getSceneControlButtons(controls) {
	const tokens = controls.find((c) => c.name === 'token');
	if (game.user.isGM)
		tokens.tools.push({
			name: 'dungeon-mode',
			title: 'Dungeon Mode',
			icon: 'fas fa-dungeon',
			active: movementRestricted(),
			toggle: true,
			onClick: (active) => {
				game.settings.set(NAME, 'counter', game.settings.get(NAME, 'counter') + 1);
				if (active) {
					ui.notifications.notify('Dungeon mode is now ACTIVE: player movement is restricted');
				} else ui.notifications.notify('Dungeon Mode is now INACTIVE: players can move freely');
			},
		});
	if (game.settings.get(NAME, 'pass-turn-btn'))
		tokens.tools.push({
			name: 'pass-turn',
			title: 'Pass Turn',
			icon: 'fa-solid fa-arrows-spin',
			button: true,
			onClick: passTurn,
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
	const scenes = new Set([game.scenes.find((s) => s.active), ...game.users.filter((user) => !user.isGM).map((p) => game.scenes.get(p.viewedScene))]);
	scenes.delete(undefined);
	const tokens = [];
	for (const scene of scenes) {
		tokens.push(...scene.tokens.filter((t) => t.hasPlayerOwner && !t.hidden));
	}
	return shuffleArray(tokens.sort((a, b) => 1 - 2 * (a.id > b.id)));
}

function currentToken(restrictedTokens = getAllRestrictedTokens()) {
	return checkTokenOrder(0, restrictedTokens);
}

function nextToken(restrictedTokens = getAllRestrictedTokens()) {
	return checkTokenOrder(1, restrictedTokens);
}

function checkTokenOrder(order = 0, restrictedTokens = getAllRestrictedTokens()) {
	if (!game.combat) {
		const turn = (turnOrder() + order) % restrictedTokens.length;
		return restrictedTokens[turn];
	}
	const turn = (game.combat.turn + order) % game.combat.turns.length;
	return game.combat.turns[turn].token;
}

function allowMovement(token) {
	if (!movementRestricted() || game.user.isGM) return true;
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
			const current = currentToken();
			const hideName = !current.hidden && ![30, 50].includes(current.displayName);
			if (hideName) ui.notifications.warn(`It is currently someone else's turn...`);
			else ui.notifications.warn(`It is currently ${current.name}'s turn...`);
		}
	}
}

function passTurn() {
	const t = currentToken();
	if (!movementRestricted()) {
		ui.notifications.notify('Movement is not restricted');
		return;
	}
	if (t.isOwner && allowMovement(t)) {
		const current = nextToken();
		const hideName = !current.hidden && ![30, 50].includes(current.displayName);
		getJournal().setFlag(NAME, 'order', turnOrder() + 1);
		if (hideName && !game.user.isGM) ui.notifications.notify('Turn passed to someone else...');
		else ui.notifications.notify(`Turn passed to ${current.name}...`);
		game.combat?.nextTurn();
	} else {
		const current = currentToken();
		const hideName = !current.hidden && ![30, 50].includes(current.displayName);
		if (hideName) ui.notifications.warn(`It's currently someone else's turn...`);
		else ui.notifications.warn(`It's currently ${current.name}'s turn...`);
	}
}

export function createApi() {
	game.modules.get(NAME).api = { passTurn };
}

export function updateMarks() {
	setTimeout(() => {
		if (movementRestricted()) {
			const restrictedTokens = getAllRestrictedTokens();
			const current = currentToken(restrictedTokens);
			const next = nextToken(restrictedTokens);
			applyMarks(current, next);
		} else removeMarks();
	}, 100);
}

export function turnNotifications() {
	if (!movementRestricted()) return;
	const current = currentToken();
	if (game.settings.get(NAME, 'token-highlight') && (current.isOwner || !current.hidden) && current.object) canvas.ping(current.object.center);
	if (game.user.isGM) return;
	if (current.isOwner) ui.notifications.notify("It's your turn!");
	else if (nextToken().isOwner) ui.notifications.notify('Your turn is next!');
}

export function turns() {
	const restrictedTokens = getAllRestrictedTokens();
	const order = [];
	const base = turnOrder();
	for (let i = 0; i < restrictedTokens.length; i++) {
		const turn = restrictedTokens[(base + i) % restrictedTokens.length];
		order.push(turn);
	}
	return order;
}
