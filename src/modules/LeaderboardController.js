import BaseController from "./BaseController.js";
import { enc } from "./encode.js";

export default class LeaderboardController extends BaseController {
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
		return this.get(`/leaderboards/${enc(category, 'category')}?resultLimit=${resultLimit}`);
	}

	/**
	 * Get all leaderboard categories.
	 * @returns {Promise<string[]>} The list of leaderboard categories
	 */
	async getLeaderboardCategories() {
		return this.get(`/leaderboards/types`);
	}
}
