import { updateMarks, turnNotifications, turns } from './dungeonmode.js';

export const NAME = 'restrict-movement';

export function registerSettings() {
	game.settings.register(NAME, 'counter', {
		name: 'dungeon modes counter',
		scope: 'world',
		config: false,
		type: Number,
		default: 0,
		onChange: () => {
			const active = movementRestricted();
			updateMarks();
			turnNotifications();
			if (active && game.user.isGM) {
				const order = turns();
				ChatMessage.create({
					content: `  <div class="card-draw flexrow">
                                    <img class="card-face" src="icons/magic/time/hourglass-tilted-gray.webp" alt="img-name"/>
                                    <h4 class="card-name">Dungeon Mode: Turn Order</h4>
                                </div>
                                <ol>${order.map((t) => `<li>${t.name}</li>`).join('')}</ol>`,
					whisper: [game.user.id],
				});
			}
		},
	});
	game.settings.register(NAME, 'pass-turn-btn', {
		name: 'Show Pass Turn Button',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true,
		hint: 'Enables/disables the button, in case you want to use the macro instead.',
		requiresReload: true,
	});
	game.settings.register(NAME, 'token-highlight', {
		name: 'Token Highlight',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true,
		hint: 'Enables/disables token highlight when a turn starts.',
	});
}

const JOURNAL_NAME = 'dungeon-mode-data';

export function getJournal() {
	return game.journal.getName(JOURNAL_NAME);
}

export function removeJournal(dir, html) {
	const JOURNAL_ID = getJournal().id;
	html[0].querySelector(`li[data-document-id="${JOURNAL_ID}"]`)?.remove();
}

export function createJournal() {
	const journal = getJournal();
	if (game.user.isGM && journal.ownership.default !== 3) journal.update({ 'ownership.default': 3 });
	if (journal) return;
	JournalEntry.create({
		name: JOURNAL_NAME,
		'ownership.default': 3,
		'flags.restrict-movement': { order: 0 },
	});
}

export function turnOrder() {
	return getJournal().getFlag(NAME, 'order');
}

export function movementRestricted() {
	return Boolean(game.settings.get(NAME, 'counter') % 2);
}
