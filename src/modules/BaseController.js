/**
 * Common base of all controllers: holds the ApiCaller and builds API URLs.
 */
export default class BaseController {
	/** @param api {import('./ApiCaller.js').default} */
	constructor(api) {
		this.api = api;
	}

	/**
	 * GET an API path (relative to the API base URL).
	 * Path parameters must already be encoded (see encode.js).
	 * @param path {string}
	 * @param options {{cacheTime?: number}} [options]
	 * @returns {Promise<any>}
	 */
	get(path, options) {
		const url = this.api.url + path;
		return options ? this.api.request(url, options) : this.api.request(url);
	}
}
