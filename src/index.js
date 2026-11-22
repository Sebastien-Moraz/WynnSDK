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
import WynnApiError from "./modules/WynnApiError.js";
import { enc } from "./modules/encode.js";

export default class WynnSDK {
	/**
	 * @param tokenOrOptions {string|null|{token?: string|null, timeout?: number, maxRetries?: number, debug?: boolean, fetch?: Function}}
	 *   Either the API token, or an options object.
	 * @param options {{timeout?: number, maxRetries?: number, debug?: boolean, fetch?: Function}} Options (when the first argument is a token)
	 */
	constructor(tokenOrOptions = null, options = {}) {
		const opts = (tokenOrOptions !== null && typeof tokenOrOptions === 'object')
			? { ...tokenOrOptions }
			: { ...options, token: tokenOrOptions };

		// Each SDK instance has its own token, cache and rate limiter.
		this.api = new ApiCaller(opts);
		this.player = new PlayerController(this.api);
		this.guild = new GuildController(this.api);
		this.item = new ItemController(this.api);
		this.leaderboard = new LeaderboardController(this.api);
		this.ability = new AbilityController(this.api);
		this.aspect = new AspectController(this.api);
		this.map = new MapController(this.api);
		this.quest = new QuestController(this.api);
		this.class = new ClassController(this.api);
		this.news = new NewsController(this.api);
	}

	/**
	 * Make a global search
	 * @param query {string} The search query (e.g., "Idol", "Myiro", "Forgotten Library", etc.)
	 * @returns {Promise<Object>} The search results
	 */
	async search(query) {
		return this.api.request(`${this.api.url}/search/${enc(query, 'query')}`);
	}

	/** Remove every cached response of this instance. */
	clearCache() {
		this.api.clearCache();
	}
}

export { WynnSDK, WynnApiError };
