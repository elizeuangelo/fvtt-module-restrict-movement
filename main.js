import { registerSettings, createJournal, removeJournal } from './module/settings.js';
import { getSceneControlButtons, preUpdateToken, createApi, updateMarks, turnNotifications } from './module/dungeonmode.js';

Hooks.on('getSceneControlButtons', getSceneControlButtons);
Hooks.on('preUpdateToken', preUpdateToken);
Hooks.on('renderJournalDirectory', removeJournal);
Hooks.on('updateCombat', () => {
	updateMarks();
	turnNotifications();
});
Hooks.on('deleteCombat', updateMarks);
Hooks.once('setup', registerSettings);
Hooks.once('ready', () => {
	createJournal();
	createApi();
	updateMarks();
	Hooks.on('drawToken', updateMarks);
	Hooks.on('updateJournalEntry', (journal, data) => {
		if (!('restrict-movement' in data.flags)) return;
		updateMarks();
		turnNotifications();
	});
});
