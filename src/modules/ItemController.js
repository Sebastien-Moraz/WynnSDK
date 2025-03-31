import ApiCaller from "./ApiCaller.js";

export default class ItemController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}
	
	async getItemList(page = 1) {
		const url = `${this.api.url}/item/database?page=${page}`;
		return await this.api.request(url);
	}
	
	async getItemFullList() {
		const url = `${this.api.url}/item/database?fullResults=true`;
		return await this.api.request(url);
	}
	
	async searchItem(query) {
		const url = `${this.api.url}/item/search/${query}`;
		return await this.api.request(url);
	}
	
	async getItemMetadata() {
		const url = `${this.api.url}/item/metadata`;
		return await this.api.request(url);
	}
	
	//TODO: add advanced search
}