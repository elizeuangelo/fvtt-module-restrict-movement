import { updateMarks, turnNotifications } from './dungeonmode.js';

export const NAME = 'restrict-movement';

export function registerSettings() {
	game.settings.register(NAME, 'movement-restricted', {
		name: 'movement restricted',
		scope: 'world',
		config: false,
		type: Boolean,
		default: false,
		onChange: () => {
			updateMarks();
			turnNotifications();
		},
	});
	game.settings.register(NAME, 'counter', {
		name: 'dungeon modes counter',
		scope: 'world',
		config: false,
		type: Number,
		default: 0,
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
	if (getJournal()) return;
	JournalEntry.create({
		name: JOURNAL_NAME,
		'ownership.default': 3,
		'flags.restrict-movement': { order: 0 },
	});
}

export function turnOrder() {
	return getJournal().getFlag(NAME, 'order');
}
