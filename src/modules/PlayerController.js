import ApiCaller from "./ApiCaller.js";

export default class PlayerController {
	constructor() {
		this.api = ApiCaller.getInstance();
	}

	/**
	 * Get player data by username or UUID
	 * @param usernameOrUUID {string} - The username or UUID of the player
	 * @returns {Promise<Object>} - The short player data
	 */
	async getPlayer(usernameOrUUID) {
		const url = `${this.api.url}/player/${usernameOrUUID}`;
		return await this.api.request(url);
	}

	/**
	 * Get full player stats by username or UUID
	 * @param usernameOrUUID {string} - The username or UUID of the player
	 * @returns {Promise<Object>} - The full player data
	 */
	async getPlayerFullStats(usernameOrUUID) {
		const url = `${this.api.url}/player/${usernameOrUUID}?fullStats=true`;
		return await this.api.request(url);
	}

	/**
	 * Get all player characters by username or UUID
	 * @param usernameOrUUID {string} - The username or UUID of the player
	 * @returns {Promise<Object[]>} - The list of player characters
	 */
	async getPlayerCharacters(usernameOrUUID) {
		const url = `${this.api.url}/player/${usernameOrUUID}/characters`;
		return await this.api.request(url);
	}

	/**
	 * Get player character data by username or UUID and character UUID
	 * @param usernameOrUUID {string} - The username or UUID of the player
	 * @param characterUUID {string} - The UUID of the character
	 * @returns {Promise<Object>} - The character data
	 */
	async getPlayerCharacter(usernameOrUUID, characterUUID) {
		const url = `${this.api.url}/player/${usernameOrUUID}/characters/${characterUUID}`;
		return await this.api.request(url);
	}

	/**
	 * Get player character abilities by username or UUID and character UUID
	 * @param usernameOrUUID {string} - The username or UUID of the player
	 * @param characterUUID {string} - The UUID of the character
	 * @returns {Promise<Object>} - The character abilities
	 */
	async getPlayerCharacterAbilities(usernameOrUUID, characterUUID) {
		const url = `${this.api.url}/player/${usernameOrUUID}/characters/${characterUUID}/abilities`;
		return await this.api.request(url);
	}

	/**
	 * get all players connected with your public IP address
	 * @returns {Promise<Object[]>} - The list of players connected with your public IP address
	 */
	async getWhoami() {
		const url = `${this.api.url}/player/whoami`;
		return await this.api.request(url, {cacheTime: 5});
	}

	/**
	 * Get players online on a server
	 * @param identifier {string} - The identifier to search by (username or UUID)
	 * @param server {string|null} - The server to search on (optional, e.g. "EU1", "US2")
	 * @returns {Promise<Object[]>} - The list of players online
	 */
	async getPlayersOnline(identifier = "username", server = null) {
		const url = `${this.api.url}/player?identifier=${identifier}${server ? `&server=${server}` : ""}`;
		return await this.api.request(url);
	}

	/**
	 * Get player, quild, party and friends information for player connected with your public IP address
	 * @returns {Promise<Object>} - The player, guild, party and friends information
	 */
	async getPlayerLocations() {
		const url = `${this.api.url}/map/locations/player`;
		return await this.api.request(url, {cacheTime: 15});
	}

	/**
	 * Get the list of hunters in the same server as the specified player
	 * @warning This method makes a lot of requests to the API, so use it with caution
	 * @param usernameOrUUID {string} - The username or UUID of the player connected with your public IP address
	 * @returns {Promise<Awaited<null|{activeCharacter}|Object>[]>} - The list of hunters in the same server
	 */
	async getHuntersInSameServer(usernameOrUUID) {
		const loggedPlayers = await this.getPlayerLocations();
		const targetPlayer = loggedPlayers.find(player =>
			player.name === usernameOrUUID || player.uuid === usernameOrUUID
		);
		if (!targetPlayer) {
			throw new Error('Player not found');
		}
		const players = await this.getPlayersOnline("uuid", targetPlayer.server);
		const hunters = await Promise.all(
			Object.keys(players.players).map(async (uuid) => {
				const playerData = await this.getPlayerFullStats(uuid);
				if (!playerData.activeCharacter) return null;

				const characterData = await this.getPlayerCharacter(uuid, playerData.activeCharacter);
				if (!characterData?.gamemode?.some(mode => mode === "hunted")) return null;

				playerData.character = characterData;
				return playerData;
			})
		);
		return hunters.filter(Boolean);
	}
}