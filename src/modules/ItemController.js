import ApiCaller from "./ApiCaller.js";

export default class ItemController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}

	/**
	 * Get the list of items by page
	 * @param page {number} - The page number to get
	 * @returns {Promise<Object>} - The list of items
	 */
	async getItemList(page = 1) {
		const url = `${this.api.url}/item/database?page=${page}`;
		return await this.api.request(url);
	}

	/**
	 * Get full list of items
	 * @returns {Promise<Object>} - The full list of items
	 */
	async getItemFullList() {
		const url = `${this.api.url}/item/database?fullResults=true`;
		return await this.api.request(url);
	}

	/**
	 * Get item data by item name
	 * @param query {string} - The name of the item
	 * @returns {Promise<Object>} - The item data
	 */
	async searchItem(query) {
		const url = `${this.api.url}/item/search/${query}`;
		return await this.api.request(url);
	}

	/**
	 * Get all possible item metadata
	 * @returns {Promise<Object>} - The item metadata
	 */
	async getItemMetadata() {
		const url = `${this.api.url}/item/metadata`;
		return await this.api.request(url);
	}
	
	//TODO: add advanced search
}