import ApiCaller from "./ApiCaller.js";

export default class AspectController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}

	/**
	 * Get all data for a specific aspect by class name
	 * @param className {string} The name of the class (e.g., "warrior", "mage")
	 * @returns {Promise<Object>} The list of aspects for the class
	 */
	async getAspectList(className) {
		const url = `${this.api.url}/aspects/${className}`;
		return await this.api.request(url);
	}
}
	