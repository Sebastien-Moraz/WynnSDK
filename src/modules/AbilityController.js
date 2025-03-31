import ApiCaller from "./ApiCaller.js";

export default class AbilityController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}
	
	async getAbilityTree(className) {
		const url = `${this.api.url}/ability/tree/${className}`;
		return await this.api.request(url);
	}
	
	async getAbilityMap(className) {
		const url = `${this.api.url}/ability/map/${className}`;
		return await this.api.request(url);
	}
}