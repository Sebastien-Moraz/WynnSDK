import { enc } from "./encode.js";

export default class LeaderboardController {
	/** @param api {import('./ApiCaller.js').default} */
	constructor(api) {
		this.api = api;
	}

	/**
	 * Get leaderboard data.
	 * @param category {string} Category of leaderboard (see getLeaderboardCategories)
	 * @param resultLimit {number} Number of results to return (default 100, max 1000)
	 * @returns {Promise<Object>} The leaderboard data
	 */
	async getLeaderboard(category, resultLimit = 100) {
		if (!Number.isInteger(resultLimit) || resultLimit < 1 || resultLimit > 1000) {
			throw new TypeError('resultLimit must be an integer between 1 and 1000');
		}
		return this.api.request(`${this.api.url}/leaderboards/${enc(category, 'category')}?resultLimit=${resultLimit}`);
	}

	/**
	 * Get all leaderboard categories.
	 * @returns {Promise<string[]>} The list of leaderboard categories
	 */
	async getLeaderboardCategories() {
		return this.api.request(`${this.api.url}/leaderboards/types`);
	}
}
