export default class NewsController {
	/** @param api {import('./ApiCaller.js').default} */
	constructor(api) {
		this.api = api;
	}

	/**
	 * Get the latest news
	 * @returns {Promise<Object[]>} The list of latest news
	 */
	async getNews() {
		return this.api.request(`${this.api.url}/latest-news`);
	}
}
