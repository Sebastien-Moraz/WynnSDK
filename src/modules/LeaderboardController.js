import ApiCaller from "./ApiCaller.js";

export default class LeaderboardController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}
	
	async getLeaderboard(category, resultLimit = 100) {
		const url = `${this.api.url}/leaderboards/${category}?resultLimit=${resultLimit}`;
		return await this.api.request(url);
	}
	
	async getLeaderboardCategories() {
		const url = `${this.api.url}/leaderboards/types`;
		return await this.api.request(url);
	}
}