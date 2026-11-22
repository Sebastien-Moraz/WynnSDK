import BaseController from "./BaseController.js";
import { enc } from "./encode.js";

export default class AbilityController extends BaseController {
	/**
	 * Get all data for a specific ability tree
	 * @param className {string} The name of the class (e.g., "warrior", "mage")
	 * @returns {Promise<Object>} The ability tree of the class
	 */
	async getAbilityTree(className) {
		return this.get(`/ability/tree/${enc(className, 'className')}`);
	}

	/**
	 * Get all data for a specific ability map
	 * @param className {string} The name of the class (e.g., "warrior", "mage")
	 * @returns {Promise<Object>} The ability map of the class
	 */
	async getAbilityMap(className) {
		return this.get(`/ability/map/${enc(className, 'className')}`);
	}
}
