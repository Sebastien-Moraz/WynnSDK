import BaseController from "./BaseController.js";
import { enc } from "./encode.js";

export default class AspectController extends BaseController {
	/**
	 * Get all aspects of a class
	 * @param className {string} The name of the class (e.g., "warrior", "mage")
	 * @returns {Promise<Object[]>} The list of aspects for the class
	 */
	async getAspectList(className) {
		return this.get(`/aspects/${enc(className, 'className')}`);
	}
}
