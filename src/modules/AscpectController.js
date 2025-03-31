import ApiCaller from "./ApiCaller.js";

export default class AscpectController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}

	async getAspectList(className) {
		const url = `${this.api.url}/aspects/${className}`;
		return await this.api.request(url);
	}
}
	