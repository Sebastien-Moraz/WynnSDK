import ApiCaller from "./ApiCaller.js";

export default class GuildController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}
	async getGuild(guildName, identifier = "username") {
		const url = `${this.api.url}/guild/${guildName}?identifier=${identifier}`;
		return await this.api.request(url);
	}
	
	async getGuildByPrefix(guildPrefix, identifier = "username") {
		const url = `${this.api.url}/guild/prefix/${guildPrefix}?identifier=${identifier}`;
		return await this.api.request(url);
	}
	
	async getGuildList(identifier = "name") {
		const url = `${this.api.url}/guild/list/guild?identifier=${identifier}`;
		return await this.api.request(url);
	}
	
	async getGuildTerritoryList() {
		const url = `${this.api.url}/guild/list/territory`;
		return await this.api.request(url);
	}
}