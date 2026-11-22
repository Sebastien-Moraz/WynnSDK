export default class MapController {
	/** @param api {import('./ApiCaller.js').default} */
	constructor(api) {
		this.api = api;
	}

	/**
	 * Get all map location markers
	 * @returns {Promise<Object[]>} The list of all map location markers
	 */
	async getMapMarkers() {
		return this.api.request(`${this.api.url}/map/locations/markers`);
	}
}
