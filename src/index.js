import PlayerController from "./modules/PlayerController.js";

globalThis.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default class WynnSDK {
	constructor() {
		this.player = new PlayerController();
	}
}

(async () => {
	const sdk = new WynnSDK();
	console.log(await sdk.player.getWhoami());
	console.log(await sdk.player.getPlayer("Myiro"));
	console.log(await sdk.player.getPlayerFullStats("Myiro"));
	console.log(await sdk.player.getPlayerCharacters("Myiro"));
	console.log(await sdk.player.getPlayerCharacter("Myiro", "d3d5ad24-b1c5-4626-9587-3dc0c6c5345f"));
	console.log(await sdk.player.getPlayerCharacterAbilities("Myiro", "d3d5ad24-b1c5-4626-9587-3dc0c6c5345f"));
	console.log(await sdk.player.getPlayersOnline("uuid"));
})();