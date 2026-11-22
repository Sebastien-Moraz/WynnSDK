export default class QuestController {
	/** @param api {import('./ApiCaller.js').default} */
	constructor(api) {
		this.api = api;
	}

	/**
	 * Get quests count
	 * @returns {Promise<number>} The number of quests available
	 */
	async getQuestCount() {
		return (await this.api.request(`${this.api.url}/map/quests`)).quests;
	}
}
