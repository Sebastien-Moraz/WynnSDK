import ApiCaller from "./ApiCaller.js";

export default class ClassController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}
	
	async getClassList() {
		const url = `${this.api.url}/classes`;
		return await this.api.request(url);
	}
	
	async getClass(className) {
		const url = `${this.api.url}/classes/${className}`;
		return await this.api.request(url);
	}
}