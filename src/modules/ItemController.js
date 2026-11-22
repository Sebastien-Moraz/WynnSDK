import BaseController from "./BaseController.js";
import { enc } from "./encode.js";

export default class ItemController extends BaseController {
	/**
	 * Get the list of items by page
	 * @param page {number} The page number to get (starts at 1)
	 * @returns {Promise<Object>} The list of items
	 */
	async getItemList(page = 1) {
		if (!Number.isInteger(page) || page < 1) {
			throw new TypeError('page must be a positive integer');
		}
		return this.get(`/item/database?page=${page}`);
	}

	/**
	 * Get full list of items
	 * @returns {Promise<Object>} The full list of items
	 */
	async getItemFullList() {
		return this.get(`/item/database?fullResult`);
	}

	/**
	 * Search items by name
	 * @param query {string} The name of the item
	 * @returns {Promise<Object>} The matching items
	 */
	async searchItem(query) {
		return this.get(`/item/search/${enc(query, 'query')}`);
	}

	/**
	 * Get all possible item metadata
	 * @returns {Promise<Object>} The item metadata
	 */
	async getItemMetadata() {
		return this.get(`/item/metadata`);
	}

	//TODO: add advanced search
}
