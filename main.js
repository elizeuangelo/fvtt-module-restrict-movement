import { registerSettings, createJournal, removeJournal } from './module/settings.js';
import { getSceneControlButtons, preUpdateToken, createApi } from './module/dungeonmode.js';

Hooks.once('setup', registerSettings);
Hooks.once('ready', createJournal);
Hooks.once('ready', createApi);
Hooks.on('getSceneControlButtons', getSceneControlButtons);
Hooks.on('preUpdateToken', preUpdateToken);
Hooks.on('renderJournalDirectory', removeJournal);
