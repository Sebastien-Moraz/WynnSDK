import BaseController from "./BaseController.js";

export default class MapController extends BaseController {
	/**
	 * Get all map location markers
	 * @returns {Promise<Object[]>} The list of all map location markers
	 */
	async getMapMarkers() {
		return this.get(`/map/locations/markers`);
	}
}
