import { enc } from "./encode.js";

export default class AspectController {
	/** @param api {import('./ApiCaller.js').default} */
	constructor(api) {
		this.api = api;
	}

	/**
	 * Get all aspects of a class
	 * @param className {string} The name of the class (e.g., "warrior", "mage")
	 * @returns {Promise<Object[]>} The list of aspects for the class
	 */
	async getAspectList(className) {
		return this.api.request(`${this.api.url}/aspects/${enc(className, 'className')}`);
	}
}
