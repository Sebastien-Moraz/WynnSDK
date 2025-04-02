import ApiCaller from "./ApiCaller.js";

export default class QuestController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}

	/**
	 * Get quests count
	 * @returns {Promise<number>} The number of quests available
	 */
	async getQuestCount() {
		const url = `${this.api.url}/map/quests`;
		return (await this.api.request(url))["quests"];
	}
}