import BaseController from "./BaseController.js";

export default class NewsController extends BaseController {
	/**
	 * Get the latest news
	 * @returns {Promise<Object[]>} The list of latest news
	 */
	async getNews() {
		return this.get(`/latest-news`);
	}
}
