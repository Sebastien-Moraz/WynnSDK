import ApiCaller from "./ApiCaller.js";

export default class MapController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}

	/**
	 * Get all map locations markers
	 * @returns {Promise<Object>} The list of all map locations markers
	 */
	async getMapMarkers() {
		const url = `${this.api.url}/map/locations/markers`;
		return await this.api.request(url);
	}
}