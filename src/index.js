import PlayerController from "./modules/PlayerController.js";
import GuildController from "./modules/GuildController.js";
import ItemController from "./modules/ItemController.js";

globalThis.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default class WynnSDK {
	constructor() {
		this.player = new PlayerController();
		this.guild = new GuildController();
		this.item = new ItemController();
	}
}

(async () => {
	const sdk = new WynnSDK();
	/*console.log(await sdk.player.getWhoami());
	console.log(await sdk.player.getPlayer("Myiro"));
	console.log(await sdk.player.getPlayerFullStats("Myiro"));
	console.log(await sdk.player.getPlayerCharacters("Myiro"));
	console.log(await sdk.player.getPlayerCharacter("Myiro", "d3d5ad24-b1c5-4626-9587-3dc0c6c5345f"));
	console.log(await sdk.player.getPlayerCharacterAbilities("Myiro", "d3d5ad24-b1c5-4626-9587-3dc0c6c5345f"));
	console.log(await sdk.player.getPlayersOnline("uuid"));
	console.log(await sdk.guild.getGuild("Forgotten Library"));
	console.log(await sdk.guild.getGuildByPrefix("FGL"));
	console.log(await sdk.guild.getGuildList());
	console.log(await sdk.guild.getGuildTerritoryList());
	console.log(await sdk.item.getItemList());
	console.log(await sdk.item.getItemList(2));
	console.log(await sdk.item.getItemFullList());
	console.log(await sdk.item.searchItem("Idol"));
	console.log(await sdk.item.getItemMetadata());*/
	
})();