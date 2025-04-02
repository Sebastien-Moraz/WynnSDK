import ApiCaller from "./ApiCaller.js";

export default class ClassController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}

	/**
	 * Get short data for all classes
	 * @returns {Promise<Object>} The list of all classes with short data
	 */
	async getClassList() {
		const url = `${this.api.url}/classes`;
		return await this.api.request(url);
	}

	/**
	 * Get all data for a specific class
	 * @param className {string} The name of the class (e.g., "warrior", "mage")
	 * @returns {Promise<Object>} all data for the class
	 */
	async getClass(className) {
		const url = `${this.api.url}/classes/${className}`;
		return await this.api.request(url);
	}
}