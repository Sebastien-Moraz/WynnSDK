import { enc } from "./encode.js";

export default class AbilityController {
	/** @param api {import('./ApiCaller.js').default} */
	constructor(api) {
		this.api = api;
	}

	/**
	 * Get all data for a specific ability tree
	 * @param className {string} The name of the class (e.g., "warrior", "mage")
	 * @returns {Promise<Object>} The ability tree of the class
	 */
	async getAbilityTree(className) {
		return this.api.request(`${this.api.url}/ability/tree/${enc(className, 'className')}`);
	}

	/**
	 * Get all data for a specific ability map
	 * @param className {string} The name of the class (e.g., "warrior", "mage")
	 * @returns {Promise<Object>} The ability map of the class
	 */
	async getAbilityMap(className) {
		return this.api.request(`${this.api.url}/ability/map/${enc(className, 'className')}`);
	}
}
