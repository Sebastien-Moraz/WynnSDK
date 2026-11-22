// Type definitions for wynnsdk

export interface WynnSDKOptions {
    /** Wynncraft API token (raises the rate limit from 50 to 120 requests/minute). */
    token?: string | null;
    /** Request timeout in milliseconds. Default: 10000. */
    timeout?: number;
    /** Maximum number of retries when the API answers 429. Default: 3. */
    maxRetries?: number;
    /** Log every request with console.debug. Default: false. */
    debug?: boolean;
    /** Custom fetch implementation. Default: globalThis.fetch. */
    fetch?: typeof fetch;
}

export default class WynnSDK {
    constructor(options?: WynnSDKOptions);
    constructor(token?: string | null, options?: Omit<WynnSDKOptions, 'token'>);

    player: PlayerController;
    guild: GuildController;
    item: ItemController;
    leaderboard: LeaderboardController;
    ability: AbilityController;
    aspect: AspectController;
    map: MapController;
    quest: QuestController;
    class: ClassController;
    news: NewsController;

    search(query: string): Promise<SearchResponse>;
    clearCache(): void;
}

export { WynnSDK };

export class WynnApiError extends Error {
    name: 'WynnApiError';
    /** Requested URL. */
    url: string | null;
    /** HTTP status code, or null for network errors and timeouts. */
    status: number | null;
    /** Parsed JSON error body returned by the API, if any. */
    body: unknown;
}

// ==========================================
// Controllers
// ==========================================

export type PlayerIdentifier = 'username' | 'uuid';
export type GuildListIdentifier = 'name' | 'uuid';

export interface PlayerController {
    getPlayer(usernameOrUUID: string): Promise<PlayerData>;
    getPlayerFullStats(usernameOrUUID: string): Promise<PlayerFullData>;
    getPlayerCharacters(usernameOrUUID: string): Promise<Record<string, PlayerCharacterShort>>;
    getPlayerCharacter(usernameOrUUID: string, characterUUID: string): Promise<CharacterData>;
    getPlayerCharacterAbilities(usernameOrUUID: string, characterUUID: string): Promise<AbilityMap>;
    getWhoami(): Promise<Record<string, WhoamiPlayer>>;
    getPlayersOnline(identifier?: PlayerIdentifier, server?: string | null): Promise<PlayersOnlineResponse>;
    getPlayerLocations(): Promise<PlayerLocation[]>;
    getHuntersInSameServer(usernameOrUUID: string): Promise<HunterData[]>;
}

export interface GuildController {
    getGuild(guildName: string, identifier?: PlayerIdentifier): Promise<GuildData>;
    getGuildByPrefix(guildPrefix: string, identifier?: PlayerIdentifier): Promise<GuildData>;
    getGuildList(identifier?: GuildListIdentifier): Promise<GuildList>;
    getGuildTerritoryList(): Promise<Record<string, GuildTerritory>>;
}

export interface ItemController {
    getItemList(page?: number): Promise<ItemListResponse>;
    getItemFullList(): Promise<ItemData[]>;
    searchItem(query: string): Promise<ItemData[]>;
    getItemMetadata(): Promise<ItemMetadataResponse>;
}

export interface LeaderboardController {
    /** @param resultLimit Between 1 and 1000. Default: 100. */
    getLeaderboard(category: string, resultLimit?: number): Promise<Record<string, LeaderboardEntry>>;
    getLeaderboardCategories(): Promise<string[]>;
}

export interface AbilityController {
    getAbilityTree(className: string): Promise<AbilityTree>;
    getAbilityMap(className: string): Promise<AbilityMap>;
}

export interface AspectController {
    getAspectList(className: string): Promise<AspectData[]>;
}

export interface ClassController {
    getClassList(): Promise<Record<string, ClassShort>>;
    getClass(className: string): Promise<ClassData>;
}

export interface MapController {
    getMapMarkers(): Promise<MapMarker[]>;
}

export interface QuestController {
    getQuestCount(): Promise<number>;
}

export interface NewsController {
    getNews(): Promise<NewsArticle[]>;
}

export interface HunterData extends PlayerFullData {
    character: CharacterData;
}

export interface ItemIcon {
    value: {
        id: string;
        name: string;
        customModelData?: { rangeDispatch: number[] };
    };
    format: string;
    name?: string; // Sometimes present (e.g. archetypes)
}

// ==========================================
// Search
// ==========================================

export interface SearchPlayer {
    username: string;
    rank: string;
    supportRank?: string | null;
    legacyRankColour?: LegacyRankColour;
    rankBadge?: string | null;
}

export interface SearchGuild {
    name: string;
    prefix: string;
    level: number;
    members: number;
    created: string;
}

/** Every category is omitted when it has no result. */
export interface SearchResponse {
    query: string;
    players?: Record<string, SearchPlayer>; // key: player uuid
    guilds?: Record<string, SearchGuild>; // key: guild uuid
    guildsPrefix?: Record<string, SearchGuild>; // key: guild uuid
    items?: ItemData[];
    quests?: string[];
    territories?: Record<string, { start: number[]; end: number[] }>;
    discoveries?: Record<string, { start: number[]; end: number[] }>;
}

// ==========================================
// Players
// ==========================================

export interface LegacyRankColour {
    main: string;
    sub: string;
}

export interface WhoamiPlayer {
    username: string;
    online: boolean;
    nickname: string | null;
    rank: string;
    supportRank: string | null;
    shortenedRank: string | null;
    legacyRankColour: LegacyRankColour;
    rankBadge: string | null;
}

export interface PlayersOnlineResponse {
    total: number;
    players: Record<string, string>; // uuid: username
}

export interface PlayerLocationEntity {
    uuid: string;
    name: string;
    nickname: string | null;
    character: string;
    server: string;
    x: number;
    y: number;
    z: number;
}

export interface PlayerLocation extends PlayerLocationEntity {
    friends: PlayerLocationEntity[];
    party: PlayerLocationEntity[];
    guild: PlayerLocationEntity[];
}

export interface PlayerGuild {
    uuid: string;
    name: string;
    prefix: string;
    rank: string;
    rankStars: string;
}

export interface ActivityStats {
    total: number;
    list: Record<string, number>;
}

export interface RaidStats {
    damageTaken: number;
    damageDealt: number;
    healthHealed: number;
    deaths: number;
    buffsTaken: number;
    gambitsUsed: number;
}

export interface PvpStats {
    kills: number | null;
    deaths: number | null;
}

export interface GlobalData {
    contentCompletion: number;
    wars: number;
    totalLevel: number;
    mobsKilled: number;
    chestsFound: number;
    dungeons: ActivityStats;
    raids: ActivityStats;
    worldEvents: number;
    lootruns: number;
    caves: number;
    completedQuests: number;
    raidStats?: RaidStats;
    pvp?: PvpStats;
    guildRaids?: ActivityStats;
    playtime?: number;
}

export interface PlayerRestrictions {
    mainAccess: boolean;
    onlineStatus: boolean;
    guildHistoryAccess: boolean;
    characterDataAccess?: boolean;
    characterBuildAccess?: boolean;
}

export interface PlayerData {
    username: string;
    online: boolean;
    server: string | null;
    activeCharacter: string | null;
    nickname: string | null;
    uuid: string;
    rank: string;
    rankBadge: string | null;
    legacyRankColour: LegacyRankColour;
    shortenedRank: string | null;
    supportRank: string | null;
    veteran: boolean | null;
    lastJoin: string;
    ranking: Record<string, number>;
    previousRanking: Record<string, number>;
    guild: PlayerGuild | null;
    guildHistory: string[];
    firstJoin: string;
    playtime: number;
    globalData: GlobalData;
    featuredStats: Record<string, string | number>;
    wallpaper: string;
    avatar: string;
    restrictions: PlayerRestrictions;
}

export interface PlayerCharacterShort {
    type: string;
    reskin: string | null;
    nickname: string | null;
    level: number;
    xp: number;
    xpPercent: number;
    totalLevel: number;
    gamemode: string[];
    meta?: { died: boolean };
}

export interface SkillPoints {
    strength?: number;
    dexterity?: number;
    intelligence?: number;
    defense?: number;
    defence?: number;
    agility?: number;
}

export interface ProfessionDetail {
    level: number;
    xpPercent: number;
}

export interface Professions {
    fishing: ProfessionDetail;
    woodcutting: ProfessionDetail;
    mining: ProfessionDetail;
    farming: ProfessionDetail;
    scribing: ProfessionDetail;
    jeweling: ProfessionDetail;
    alchemism: ProfessionDetail;
    cooking: ProfessionDetail;
    weaponsmithing: ProfessionDetail;
    tailoring: ProfessionDetail;
    woodworking: ProfessionDetail;
    armouring: ProfessionDetail;
}

export interface CharacterData extends PlayerCharacterShort {
    preEconomy?: any | null;
    contentCompletion: number;
    wars: number;
    playtime: number;
    mobsKilled: number;
    chestsFound: number;
    itemsIdentified: number | null;
    blocksWalked: number;
    logins: number;
    deaths: number | null;
    discoveries: number;
    pvp: PvpStats;
    skillPoints: SkillPoints;
    professions: Professions;
    dungeons: ActivityStats;
    raids: ActivityStats;
    worldEvents: number;
    lootruns: number;
    caves: number;
    quests: string[];
    removedStat: any[];
    restrictions?: PlayerRestrictions;
}

export interface PlayerFullData extends PlayerData {
    characters: Record<string, CharacterData>;
}

// ==========================================
// Guilds
// ==========================================

export interface GuildMember {
    uuid: string;
    username: string;
    online: boolean;
    lastJoin: string;
    contributed: number;
    contributionRank: number;
    joined: string;
    globalData?: GlobalData;
    weekly?: {
        completed: boolean;
        streak: number;
    };
    restrictions?: Record<string, boolean>;
}

export interface GuildBanner {
    base: string;
    tier: number;
    structure: string;
    layers: { color?: string; colour?: string; pattern: string }[];
}

export interface GuildData {
    uuid: string;
    name: string;
    prefix: string;
    level: number;
    xpPercent: number;
    territories: number;
    wars: number;
    raids: number;
    created: string;
    members: {
        total: number;
        owner: Record<string, GuildMember>;
        chief: Record<string, GuildMember>;
        strategist: Record<string, GuildMember>;
        recruiter: Record<string, GuildMember>;
        recruit: Record<string, GuildMember>;
    };
    online: number;
    banner: GuildBanner;
    seasonRanks: Record<string, { rating: number; finalTerritories: number }>;
    ranking?: Record<string, number>;
}

export interface GuildList {
    [guildName: string]: {
        uuid: string;
        prefix: string;
    };
}

export interface GuildTerritory {
    guild: {
        uuid: string;
        name: string;
        prefix: string;
    };
    acquired: string;
    location: {
        start: number[];
        end: number[];
    };
}

// ==========================================
// Items
// ==========================================

export interface ItemData {
    displayName: string;
    internalName: string;
    type: string;
    subType: string;
    icon: ItemIcon;
    emblem?: string;
    tier: string;
    attackSpeed: string;
    averageDps?: number;
    restriction: string;
    dropRestriction: string;
    elements: string[];
    requirements: {
        level: number;
        classRequirement?: string;
        strength?: number;
        dexterity?: number;
        intelligence?: number;
        defence?: number;
        agility?: number;
    };
    majorIds?: Record<string, string>;
    powderSlots: number;
    lore: string;
    identifications: Record<string, any>;
    base: Record<string, any>;
}

export interface ItemListResponse {
    controller: {
        count: number;
        current_count: number;
        pages: number;
        prev: number;
        current: number;
        next: number;
    };
    results: ItemData[];
}

export interface ItemMetadataResponse {
    filters: Record<string, any>;
    static: Record<string, number>;
}

// ==========================================
// Leaderboard
// ==========================================

export interface LeaderboardEntry {
    metaScore: number;
    name: string;
    uuid: string;
    prefix: string;
    score: number;
    metadata: Record<string, any>;
    banner?: GuildBanner;
}

// ==========================================
// Abilities
// ==========================================

export interface AbilityNodeMeta {
    page: number;
    icon: ItemIcon | string;
    id?: string;
}

export interface AbilityNode {
    type: "ability" | "connector";
    coordinates: { x: number; y: number };
    meta: AbilityNodeMeta;
    family: string[];
}

export interface AbilityMap {
    [page: string]: AbilityNode[];
}

export interface ArchetypeData {
    name: string;
    description: string;
    shortDescription: string;
    icon: ItemIcon;
    slot: number;
}

export interface AbilityTreeItem {
    name: string;
    icon: ItemIcon;
    slot: number;
    coordinates: { x: number; y: number };
    description: string[];
    requirements: Record<string, number>;
    links: string[];
    page: number;
}

export interface AbilityTree {
    archetypes: Record<string, ArchetypeData>;
    pages: Record<string, Record<string, AbilityTreeItem>>;
}

// ==========================================
// Classes & Aspects
// ==========================================

export interface AspectTier {
    threshold: number;
    description: string[];
}

export interface AspectData {
    name: string;
    internalName: string;
    icon: ItemIcon;
    rarity: string;
    requiredClass: string;
    tiers: Record<string, AspectTier>;
}

export interface ClassShort {
    name: string;
    overallDifficulty: number;
}

export interface ClassArchetype {
    name: string;
    difficulty: number;
    max: number;
    icon: string;
    damage: number;
    defence: number;
    range: number;
    speed: number;
}

export interface ClassData {
    id: string;
    name: string;
    lore: string;
    overallDifficulty: number;
    overallMax: number;
    archetypes: Record<string, ClassArchetype>;
}

// ==========================================
// Map & News
// ==========================================

export interface MapMarker {
    name: string;
    icon: string;
    x: string | number;
    y: string | number;
    z: string | number;
}

export interface NewsArticle {
    title: string;
    date: string;
    forumThread: string;
    author: string;
    content: string;
    comments: string;
}
