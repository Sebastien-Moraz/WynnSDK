import ApiCaller from "./ApiCaller.js";

export default class PlayerController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}
	
	async getPlayer(usernameOrUUID) {
		const url = `${this.api.url}/player/${usernameOrUUID}`;
		return await this.api.request(url);
	}
	
	async getPlayerFullStats(usernameOrUUID) {
		const url = `${this.api.url}/player/${usernameOrUUID}?fullStats=true`;
		return await this.api.request(url);
	}
	
	async getPlayerCharacters(usernameOrUUID) {
		const url = `${this.api.url}/player/${usernameOrUUID}/characters`;
		return await this.api.request(url);
	}
	
	async getPlayerCharacter(usernameOrUUID, characterUUID) {
		const url = `${this.api.url}/player/${usernameOrUUID}/characters/${characterUUID}`;
		return await this.api.request(url);
	}
	
	async getPlayerCharacterAbilities(usernameOrUUID, characterUUID) {
		const url = `${this.api.url}/player/${usernameOrUUID}/characters/${characterUUID}/abilities`;
		return await this.api.request(url);
	}
	
	async getWhoami() {
		const url = `${this.api.url}/player/whoami`;
		return await this.api.request(url, { cacheTime: 5 });
	}
	
	async getPlayersOnline(identifier = "username", server = null) {
		const url = `${this.api.url}/player?identifier=${identifier}${server ? `&server=${server}` : ""}`;
		return await this.api.request(url);
	}

	async getPlayerLocations() {
		const url = `${this.api.url}/map/locations/player`;
		return await this.api.request(url, { cacheTime: 15 });
	}
}