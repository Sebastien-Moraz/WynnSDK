import ApiCaller from "./ApiCaller.js";

export default class QuestController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}

	async getQuestCount() {
		const url = `${this.api.url}/map/quests`;
		return await this.api.request(url);
	}
}