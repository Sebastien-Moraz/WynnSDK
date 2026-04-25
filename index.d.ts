declare module 'wynnsdk' {
    export default class WynnSDK {
        constructor(token?: string | null);

        player: PlayerController;
        guild: GuildController;
        item: ItemController;
        leaderboard: LeaderboardController;

        search(query: string): Promise<any>;
    }

    class PlayerController {
        getPlayer(usernameOrUUID: string): Promise<any>;
        getPlayerFullStats(usernameOrUUID: string): Promise<any>;
        getPlayerCharacters(usernameOrUUID: string): Promise<any[]>;
        getPlayerCharacter(usernameOrUUID: string, characterUUID: string): Promise<any>;
        getPlayerCharacterAbilities(usernameOrUUID: string, characterUUID: string): Promise<any>;
        getWhoami(): Promise<any[]>;
        getPlayersOnline(identifier?: string, server?: string | null): Promise<any>;
        getPlayerLocations(): Promise<any>;
        getHuntersInSameServer(usernameOrUUID: string): Promise<any[]>;
    }

    class GuildController {
        getGuild(guildName: string, identifier?: string): Promise<any>;
        getGuildByPrefix(guildPrefix: string, identifier?: string): Promise<any>;
        getGuildList(identifier?: string): Promise<any>;
        getGuildTerritoryList(): Promise<any>;
    }

    class ItemController {
        getItemList(page?: number): Promise<any>;
        getItemFullList(): Promise<any>;
        searchItem(query: string): Promise<any>;
        getItemMetadata(): Promise<any>;
    }

    class LeaderboardController {
        getLeaderboard(category: string, resultLimit?: number): Promise<any>;
        getLeaderboardCategories(): Promise<any>;
    }
}