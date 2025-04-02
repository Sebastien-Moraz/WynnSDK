import ApiCaller from "./ApiCaller.js";

export default class GuildController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}

	/**
	 * Get guild information by guild name
	 * @param guildName {string} - The name of the guild
	 * @param identifier {string} - The identifier type for player (username or uuid)
	 * @returns {Promise<Object>} - The guild data
	 */
	async getGuild(guildName, identifier = "username") {
		const url = `${this.api.url}/guild/${guildName}?identifier=${identifier}`;
		return await this.api.request(url);
	}

	/**
	 * Get guild information by guild prefix
	 * @param guildPrefix {string} - The prefix of the guild
	 * @param identifier {string} - The identifier type for player (username or uuid)
	 * @returns {Promise<Object>} - The guild data
	 */
	async getGuildByPrefix(guildPrefix, identifier = "username") {
		const url = `${this.api.url}/guild/prefix/${guildPrefix}?identifier=${identifier}`;
		return await this.api.request(url);
	}

	/**
	 * Get guilds list by name or uuid
	 * @param identifier {string} - The identifier type for player (name or uuid)
	 * @returns {Promise<Object>} - The list of guilds
	 */
	async getGuildList(identifier = "name") {
		const url = `${this.api.url}/guild/list/guild?identifier=${identifier}`;
		return await this.api.request(url);
	}

	/**
	 * Get guild territory list
	 * @returns {Promise<Object>} - The list of guild territories
	 */
	async getGuildTerritoryList() {
		const url = `${this.api.url}/guild/list/territory`;
		return await this.api.request(url);
	}
}