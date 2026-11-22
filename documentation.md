## API Documentation

All WynnSDK methods return **Promises** and must be used with `await` or `.then()`.

### Initialization

```javascript
import WynnSDK from 'wynnsdk';          // or: import { WynnSDK } from 'wynnsdk';

// Without token (50 requests / minute per bucket)
const sdk = new WynnSDK();

// With token (120 requests / minute per bucket)
const sdk = new WynnSDK('YOUR_API_TOKEN');

// With options
const sdk = new WynnSDK({
	token: 'YOUR_API_TOKEN', // optional
	timeout: 10000,          // request timeout in ms (default 10000)
	maxRetries: 3,           // retries when the API answers 429 (default 3)
	debug: false,            // log every request with console.debug (default false)
});

// Token + options
const sdk = new WynnSDK('YOUR_API_TOKEN', { timeout: 5000 });
```

Each `WynnSDK` instance has its **own** token, cache and rate limiter. You can safely create one instance per user / token.

### How to get an API token

Log in at [https://wynncraft.com/account/dashboard?section=dev](https://wynncraft.com/account/dashboard?section=dev) and click **Generate Token**. Then pass the token to the SDK constructor. Never commit your token: load it from an environment variable (`new WynnSDK(process.env.WYNN_TOKEN)`).

### Error handling

Failed requests throw a `WynnApiError`:

```javascript
import WynnSDK, { WynnApiError } from 'wynnsdk';

try {
	await sdk.player.getPlayer('UnknownPlayer');
} catch (e) {
	if (e instanceof WynnApiError && e.status === 404) {
		console.log('Player not found');
	}
}
```

| Property | Description |
|----------|-------------|
| `status` | HTTP status code, or `null` for network errors / timeouts |
| `url`    | Requested URL |
| `body`   | Parsed JSON error body returned by the API (if any) |

Invalid arguments (empty name, unknown `identifier`, out-of-range `resultLimit`, …) throw a `TypeError` before any request is made.

### Caching

Responses are cached in memory according to the `Cache-Control` header returned by the API. Returned objects are copies: you can safely modify them. Use `sdk.clearCache()` to empty the cache.

### Global Search

* `sdk.search(query)`: Performs a global search (e.g., "Idol", "Ragni", "Forgotten Library"). Categories without result are omitted from the response.

---

### Players (`sdk.player`)

* `getPlayer(usernameOrUUID)`: Retrieves basic player data.
* `getPlayerFullStats(usernameOrUUID)`: Retrieves full player statistics.
* `getPlayerCharacters(usernameOrUUID)`: Lists all characters (classes) of a player.
* `getPlayerCharacter(usernameOrUUID, characterUUID)`: Retrieves data for a specific character.
* `getPlayerCharacterAbilities(usernameOrUUID, characterUUID)`: Retrieves the ability tree of a character.
* `getWhoami()`: Returns the players connected from your public IP address.
* `getPlayersOnline(identifier = "username", server = null)`: Lists online players (`identifier`: `"username"` or `"uuid"`; optionally on a specific server, e.g., "EU1").
* `getPlayerLocations()`: Retrieves the locations of the players connected from your public IP address, with their guild, party, and friends.
* `getHuntersInSameServer(usernameOrUUID)`: *(Warning: consumes many API requests)* Finds players in "Hunted" mode on the same server as the targeted player (who must be connected from your public IP address).

---

### Guilds (`sdk.guild`)

* `getGuild(guildName, identifier = "username")`: Guild information via its exact name (`identifier`: `"username"` or `"uuid"`).
* `getGuildByPrefix(guildPrefix, identifier = "username")`: Guild information via its prefix (e.g., "FGL").
* `getGuildList(identifier = "name")`: Complete list of all guilds (`identifier`: `"name"` or `"uuid"`).
* `getGuildTerritoryList()`: List of all territories controlled by guilds.

---

### Items (`sdk.item`)

* `getItemList(page = 1)`: Retrieves the item database (paginated).
* `getItemFullList()`: Retrieves the complete list of items at once.
* `searchItem(query)`: Searches items by name.
* `getItemMetadata()`: Retrieves all possible item metadata.

---

### Leaderboards (`sdk.leaderboard`)

* `getLeaderboardCategories()`: Lists available leaderboard categories.
* `getLeaderboard(category, resultLimit = 100)`: Retrieves the leaderboard for a category (`resultLimit` between 1 and 1000).

---

### Abilities (`sdk.ability`)

* `getAbilityTree(className)`: Retrieves the ability tree of a class (e.g., "warrior", "mage").
* `getAbilityMap(className)`: Retrieves the ability map (node layout) of a class.

---

### Aspects (`sdk.aspect`)

* `getAspectList(className)`: Lists all aspects of a class.

---

### Classes (`sdk.class`)

* `getClassList()`: Lists all classes with short data.
* `getClass(className)`: Retrieves all data for a class.

---

### Map (`sdk.map`)

* `getMapMarkers()`: Lists all map location markers.

---

### Quests (`sdk.quest`)

* `getQuestCount()`: Returns the number of quests (a `number`).

---

### News (`sdk.news`)

* `getNews()`: Retrieves the latest news.
