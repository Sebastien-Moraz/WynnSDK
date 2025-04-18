import ApiCaller from "./ApiCaller.js";

export default class NewsController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}

	/**
	 * Get the latest news
	 * @returns {Promise<Object[]>} The list of latest news
	 */
	async getNews() {
		const url = `${this.api.url}/latest-news`;
		return await this.api.request(url);
	}
}