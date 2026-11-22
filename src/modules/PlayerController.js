import { enc, oneOf } from "./encode.js";

const IDENTIFIERS = ['username', 'uuid'];

export default class PlayerController {
	/** @param api {import('./ApiCaller.js').default} */
	constructor(api) {
		this.api = api;
	}

	/**
	 * Get player data by username or UUID
	 * @param usernameOrUUID {string} The username or UUID of the player
	 * @returns {Promise<Object>} The short player data
	 */
	async getPlayer(usernameOrUUID) {
		return this.api.request(`${this.api.url}/player/${enc(usernameOrUUID, 'usernameOrUUID')}`);
	}

	/**
	 * Get full player stats by username or UUID
	 * @param usernameOrUUID {string} The username or UUID of the player
	 * @returns {Promise<Object>} The full player data
	 */
	async getPlayerFullStats(usernameOrUUID) {
		return this.api.request(`${this.api.url}/player/${enc(usernameOrUUID, 'usernameOrUUID')}?fullResult`);
	}

	/**
	 * Get all player characters by username or UUID
	 * @param usernameOrUUID {string} The username or UUID of the player
	 * @returns {Promise<Object>} The player characters
	 */
	async getPlayerCharacters(usernameOrUUID) {
		return this.api.request(`${this.api.url}/player/${enc(usernameOrUUID, 'usernameOrUUID')}/characters`);
	}

	/**
	 * Get player character data by username or UUID and character UUID
	 * @param usernameOrUUID {string} The username or UUID of the player
	 * @param characterUUID {string} The UUID of the character
	 * @returns {Promise<Object>} The character data
	 */
	async getPlayerCharacter(usernameOrUUID, characterUUID) {
		return this.api.request(`${this.api.url}/player/${enc(usernameOrUUID, 'usernameOrUUID')}/characters/${enc(characterUUID, 'characterUUID')}`);
	}

	/**
	 * Get player character abilities by username or UUID and character UUID
	 * @param usernameOrUUID {string} The username or UUID of the player
	 * @param characterUUID {string} The UUID of the character
	 * @returns {Promise<Object>} The character abilities
	 */
	async getPlayerCharacterAbilities(usernameOrUUID, characterUUID) {
		return this.api.request(`${this.api.url}/player/${enc(usernameOrUUID, 'usernameOrUUID')}/characters/${enc(characterUUID, 'characterUUID')}/abilities`);
	}

	/**
	 * Get all players connected with your public IP address
	 * @returns {Promise<Object>} The players connected with your public IP address
	 */
	async getWhoami() {
		return this.api.request(`${this.api.url}/player/whoami`, { cacheTime: 5 });
	}

	/**
	 * Get online players, optionally filtered by server
	 * @param identifier {"username"|"uuid"} The identifier used as key
	 * @param server {string|null} The server to filter on (optional, e.g. "EU1", "US2")
	 * @returns {Promise<Object>} The online players
	 */
	async getPlayersOnline(identifier = "username", server = null) {
		oneOf(identifier, IDENTIFIERS, 'identifier');
		const serverParam = server ? `&server=${enc(server, 'server')}` : "";
		return this.api.request(`${this.api.url}/player?identifier=${identifier}${serverParam}`);
	}

	/**
	 * Get player, guild, party and friends locations for players connected with your public IP address
	 * @returns {Promise<Object[]>} The player, guild, party and friends locations
	 */
	async getPlayerLocations() {
		return this.api.request(`${this.api.url}/map/locations/player`, { cacheTime: 15 });
	}

	/**
	 * Get the list of hunters in the same server as the specified player
	 * @warning This method makes a lot of requests to the API, so use it with caution
	 * @param usernameOrUUID {string} The username or UUID of a player connected with your public IP address
	 * @returns {Promise<Object[]>} The full stats of each hunter, with their active character in `character`
	 */
	async getHuntersInSameServer(usernameOrUUID) {
		const loggedPlayers = await this.getPlayerLocations();
		const targetPlayer = loggedPlayers.find(player =>
			player.name === usernameOrUUID || player.uuid === usernameOrUUID
		);
		if (!targetPlayer) {
			throw new Error('Player not found');
		}
		if (!targetPlayer.server) {
			throw new Error('Player not found on a server');
		}
		const players = await this.getPlayersOnline("uuid", targetPlayer.server);
		const hunters = await Promise.all(
			Object.keys(players.players ?? {}).map(async (uuid) => {
				try {
					const playerData = await this.getPlayerFullStats(uuid);
					if (!playerData?.activeCharacter) return null;

					const characterData = await this.getPlayerCharacter(uuid, playerData.activeCharacter);
					if (!characterData?.gamemode?.includes("hunted")) return null;

					return { ...playerData, character: characterData };
				} catch {
					return null;
				}
			})
		);
		return hunters.filter(Boolean);
	}
}
