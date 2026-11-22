import BaseController from "./BaseController.js";

export default class QuestController extends BaseController {
	/**
	 * Get quests count
	 * @returns {Promise<number>} The number of quests available
	 */
	async getQuestCount() {
		return (await this.get(`/map/quests`)).quests;
	}
}
