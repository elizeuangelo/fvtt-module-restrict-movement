# Foundry VTT - Faendal's Restrict Movement

Introducing Dungeon Mode! A turn by turn way of exploring, looting and moving through dungeons. Inspired by a high-speed ranger named Faendal…

New players getting into D&D see battlemaps and instantly start dragging and moving their tokens around - revealing and spoiling many things. Some DM’s suggest keeping the game on pause, or drawing walls with movement restriction, and asking the players to stop interacting with the game. None of these are a real solution, and don’t encourage players to strategically crawl through a dungeon turn by turn like in the ‘good old days’.

## Installation

In the setup screen, use the manifest URL https://raw.githubusercontent.com/elizeuangelo/fvtt-module-restrict-movement/master/module.json to install the module.

## How to Use

After installing the plugin, the GM will find a small “Dungeon Mode” button on the bottom left menu bar of the Token Controls. When this mode is enabled, player controlled characters in the scene will be put into a non-combat based hidden order. The order is random each time Dungeon Mode is activated. The order is sent to the GM and can also be sent to the players in chat.

Players will be unable to move their token, or drag their token until it is their turn. If they try to move, they will be greeted with a message indicating whose turn it is. Small icons will appear over the characters head’s to indicate who is the active player, and who is next up.

At the end of each turn, players must click the “Pass Turn” button to end their turn, it is located on the main page of the Token Controls menu to the left. Alternatively, this can be done as a macro in the macro bar if desirable, utilizing the code:

`game.modules.get('restrict-movement').api.passTurn();`

Once a player passes their turn, the next player is informed by a flashing highlight effect, and the game can continue. Players are free to take their turns in order, without intervention of the GM. If need be, the GM can advance a player’s turn in the same way.

**Combat**: If combat occurs when this plugin is active, and players are added to an initiative order, the order will be overwritten and switch to the combat order. At the end of combat, the previous Dungeon Mode order will resume. There is no need to toggle the mode on and off solely for combat purposes.

## License

This work is licensed under Foundry Virtual Tabletop EULA - Limited License Agreement for module development - _Updated October 30, 2022_.
