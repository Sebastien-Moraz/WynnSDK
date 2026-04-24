import PlayerController from "./modules/PlayerController.js";
import GuildController from "./modules/GuildController.js";
import ItemController from "./modules/ItemController.js";
import LeaderboardController from "./modules/LeaderboardController.js";
import AbilityController from "./modules/AbilityController.js";
import AspectController from "./modules/AspectController.js";
import MapController from "./modules/MapController.js";
import QuestController from "./modules/QuestController.js";
import ApiCaller from "./modules/ApiCaller.js";
import ClassController from "./modules/ClassController.js";
import NewsController from "./modules/NewsController.js";

globalThis.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default class WynnSDK {
	/**
	 * @param token {string} The token of the user
	 */
	constructor(token = null) {
		this.api = ApiCaller.getInstance();
		if (token) {
			this.api.headers['Authorization'] = "Bearer " + token;
			this.api.rateLimit = 120;
		} else {
			this.api.rateLimit = 50;
		}
		this.player = new PlayerController();
		this.guild = new GuildController();
		this.item = new ItemController();
		this.leaderboard = new LeaderboardController();
		this.ability = new AbilityController();
		this.aspect = new AspectController();
		this.map = new MapController();
		this.quest = new QuestController();
		this.class = new ClassController();
		this.news = new NewsController();
	}

	/**
	 * make a global search
	 * @param query {string} The search query (e.g., "Idol", "Myiro", "Forgotten Library", etc.)
	 * @returns {Promise<Object>} The search results
	 */
	async search(query) {
		const url = `${this.api.url}/search/${query}`;
		return await this.api.request(url);
	}
}