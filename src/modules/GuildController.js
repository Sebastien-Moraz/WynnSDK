import BaseController from "./BaseController.js";
import { enc, oneOf } from "./encode.js";

const MEMBER_IDENTIFIERS = ['username', 'uuid'];
const LIST_IDENTIFIERS = ['name', 'uuid'];

export default class GuildController extends BaseController {
	/**
	 * Get guild information by guild name
	 * @param guildName {string} The name of the guild
	 * @param identifier {"username"|"uuid"} The identifier type used for members
	 * @returns {Promise<Object>} The guild data
	 */
	async getGuild(guildName, identifier = "username") {
		oneOf(identifier, MEMBER_IDENTIFIERS, 'identifier');
		return this.get(`/guild/${enc(guildName, 'guildName')}?identifier=${identifier}`);
	}

	/**
	 * Get guild information by guild prefix
	 * @param guildPrefix {string} The prefix of the guild
	 * @param identifier {"username"|"uuid"} The identifier type used for members
	 * @returns {Promise<Object>} The guild data
	 */
	async getGuildByPrefix(guildPrefix, identifier = "username") {
		oneOf(identifier, MEMBER_IDENTIFIERS, 'identifier');
		return this.get(`/guild/prefix/${enc(guildPrefix, 'guildPrefix')}?identifier=${identifier}`);
	}

	/**
	 * Get the list of all guilds
	 * @param identifier {"name"|"uuid"} The key used for each guild
	 * @returns {Promise<Object>} The list of guilds
	 */
	async getGuildList(identifier = "name") {
		oneOf(identifier, LIST_IDENTIFIERS, 'identifier');
		return this.get(`/guild/list/guild?identifier=${identifier}`);
	}

	/**
	 * Get guild territory list
	 * @returns {Promise<Object>} The list of guild territories
	 */
	async getGuildTerritoryList() {
		return this.get(`/guild/list/territory`);
	}
}
