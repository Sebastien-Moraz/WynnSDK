import BaseController from "./BaseController.js";
import { enc } from "./encode.js";

export default class ClassController extends BaseController {
	/**
	 * Get short data for all classes
	 * @returns {Promise<Object>} The list of all classes with short data
	 */
	async getClassList() {
		return this.get(`/classes`);
	}

	/**
	 * Get all data for a specific class
	 * @param className {string} The name of the class (e.g., "warrior", "mage")
	 * @returns {Promise<Object>} All data for the class
	 */
	async getClass(className) {
		return this.get(`/classes/${enc(className, 'className')}`);
	}
}
