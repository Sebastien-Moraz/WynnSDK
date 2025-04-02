import ApiCaller from "./ApiCaller.js";

export default class AbilityController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}

	/**
	 * Get all data for a specific ability tree
	 * @param className {string} The name of the class (e.g., "warrior", "mage")
	 * @returns {Promise<Object>} The list of abilities for the class
	 */
	async getAbilityTree(className) {
		const url = `${this.api.url}/ability/tree/${className}`;
		return await this.api.request(url);
	}

	/**
	 * Get all data for a specific ability Map
	 * @param className {string} The name of the class (e.g., "warrior", "mage")
	 * @returns {Promise<Object>} The list of all abilities
	 */
	async getAbilityMap(className) {
		const url = `${this.api.url}/ability/map/${className}`;
		return await this.api.request(url);
	}
}