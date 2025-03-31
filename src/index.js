import PlayerController from "./modules/PlayerController.js";
import GuildController from "./modules/GuildController.js";
import ItemController from "./modules/ItemController.js";
import LeaderboardController from "./modules/LeaderboardController.js";
import AbilityController from "./modules/AbilityController.js";
import AspectController from "./modules/AspectController.js";
import MapController from "./modules/MapController.js";
import QuestController from "./modules/QuestController.js";

globalThis.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default class WynnSDK {
	constructor() {
		this.player = new PlayerController();
		this.guild = new GuildController();
		this.item = new ItemController();
		this.leaderboard = new LeaderboardController();
		this.ability = new AbilityController();
		this.aspect = new AspectController();
		this.map = new MapController();
		this.quest = new QuestController();
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
	console.log(await sdk.item.getItemMetadata());
	console.log(await sdk.leaderboard.getLeaderboard("guildLevel"));
	console.log(await sdk.leaderboard.getLeaderboard("guildLevel", 10));
	console.log(await sdk.leaderboard.getLeaderboardCategories());
	console.log(await sdk.aspect.getAspectList("warrior"));
	console.log(await sdk.ability.getAbilityTree("warrior"));
	console.log(await sdk.ability.getAbilityMap("warrior"));
	console.log(await sdk.player.getPlayerLocations());
	console.log(await sdk.map.getMapMarkers());
	console.log(await sdk.quest.getQuestCount());*/
	
})();