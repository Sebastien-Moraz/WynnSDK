import ApiCaller from "./ApiCaller.js";

export default class MapController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}
	
	async getMapMarkers() {
		const url = `${this.api.url}/map/locations/markers`;
		return await this.api.request(url);
	}
}