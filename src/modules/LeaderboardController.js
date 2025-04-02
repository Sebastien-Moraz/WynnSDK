import ApiCaller from "./ApiCaller.js";

export default class LeaderboardController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}

	/**
	 * Get leaderboard data.
	 * @param category {string} category of leaderboard (get from getLeaderboardCategories)
	 * @param resultLimit {number} limit of results to return (default 100, max 1000)
	 * @returns {Promise<Object>} - The leaderboard data
	 */
	async getLeaderboard(category, resultLimit = 100) {
		const url = `${this.api.url}/leaderboards/${category}?resultLimit=${resultLimit}`;
		return await this.api.request(url);
	}

	/**
	 * Get all leaderboard categories.
	 * @returns {Promise<Object>} - The list of leaderboard categories
	 */
	async getLeaderboardCategories() {
		const url = `${this.api.url}/leaderboards/types`;
		return await this.api.request(url);
	}
}