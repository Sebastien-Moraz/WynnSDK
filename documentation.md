## API Documentation

All WynnSDK methods return **Promises** and must be used with `await` or `.then()`.

### Initialization

```javascript
import WynnSDK from 'wynnsdk';

// Without token (50 requests limit)
const sdk = new WynnSDK();

// With token (120 requests limit)
const sdk = new WynnSDK('YOUR_API_TOKEN');
```

### How get the api token

You can get an API token by logging in at [https://wynncraft.com/account/dashboard?section=dev](https://wynncraft.com/account/dashboard?section=dev) and clicking on the "Generate Token" button. Then copy the token and paste it in the constructor of the SDK.

### Global Search

* `sdk.search(query)`: Performs a global search (e.g., "Idol", "Myiro", "Forgotten Library").

---

### Players (`sdk.player`)

* `getPlayer(usernameOrUUID)`: Retrieves basic player data.
* `getPlayerFullStats(usernameOrUUID)`: Retrieves full player statistics.
* `getPlayerCharacters(usernameOrUUID)`: Lists all characters (classes) of a player.
* `getPlayerCharacter(usernameOrUUID, characterUUID)`: Retrieves data for a specific character.
* `getPlayerCharacterAbilities(usernameOrUUID, characterUUID)`: Retrieves the ability tree of a character.
* `getWhoami()`: Returns the players connected from your public IP address.
* `getPlayersOnline(identifier = "username", server = null)`: Lists online players (optionally on a specific server, e.g., "EU1").
* `getPlayerLocations()`: Retrieves the locations (servers) of the player, their guild, party, and friends.
* `getHuntersInSameServer(usernameOrUUID)`: *(Warning: consumes many API requests)* Finds players in "Hunted" mode on the same server as the targeted player.

---

### Guilds (`sdk.guild`)

* `getGuild(guildName, identifier = "username")`: Guild information via its exact name.
* `getGuildByPrefix(guildPrefix, identifier = "username")`: Guild information via its prefix (e.g., "ANO").
* `getGuildList(identifier = "name")`: Complete list of all guilds.
* `getGuildTerritoryList()`: List of all territories controlled by guilds.

---

### Items (`sdk.item`)

* `getItemList(page = 1)`: Retrieves the item database (paginated).
* `getItemFullList()`: Retrieves the complete list of items at once.
* `searchItem(query)`: Searches for a specific item by its name.
* `getItemMetadata()`: Retrieves all possible item metadata.

---

### Leaderboards (`sdk.leaderboard`)

* `getLeaderboardCategories()`: Lists available leaderboard categories.
* `getLeaderboard(category, resultLimit = 100)`: Retrieves the leaderboard for a category (up to 1000 results maximum).