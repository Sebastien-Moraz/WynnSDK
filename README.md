<img src="https://koppa.pro/dl/WynnSDK.png" alt="WynnSDK" width="350" style="border-radius: 10px; margin: 20px auto; display: block;">

# WynnSDK
[![NPM Version](https://img.shields.io/npm/v/wynnsdk.svg)](https://www.npmjs.com/package/wynnsdk)
[![NPM Downloads](https://img.shields.io/npm/dt/wynnsdk.svg)](https://www.npmjs.com/package/wynnsdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Unofficial SDK for the [Wynncraft API v3](https://docs.wynncraft.com/) with built-in caching and rate limiting (Fruma update supported).

## Installation

```bash
npm install wynnsdk
```

Requires **Node.js 22 or newer**. ESM only.

## Features

- 🚀 Easy-to-use wrapper for the Wynncraft API
- 💾 Built-in cache based on the API `Cache-Control` headers
- 🚦 Automatic rate limiting (per bucket) and retry on HTTP 429
- 🛡️ All parameters are URL-encoded and validated
- 🧩 TypeScript definitions included
- ⚡ Promise-based async/await support, no runtime dependencies

## Usage

```javascript
import WynnSDK from 'wynnsdk';

// Initialize the SDK (the token is optional)
const sdk = new WynnSDK(process.env.WYNN_TOKEN);

// Get player information
const player = await sdk.player.getPlayer('PlayerName');

// Get guild information
const guild = await sdk.guild.getGuild('Forgotten Library');

// Search items
const items = await sdk.item.searchItem('Idol');

// Global search (players, guilds, items, quests, territories…)
const results = await sdk.search('Ragni');

// Live locations of the players connected from your IP address
const locations = await sdk.player.getPlayerLocations();
```

### Error handling

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

## Caching & rate limits

- Cache duration is determined automatically from the `Cache-Control` / `Age` headers of each response.
- Requests are throttled locally per API bucket (50 req/min without token, 120 with a token) and synchronised with the `ratelimit-*` headers.
- On HTTP 429, the SDK waits for `Retry-After` and retries (up to `maxRetries`, default 3).
- Each `WynnSDK` instance has its own token, cache and rate limiter.

## Documentation

See [documentation.md](documentation.md) for the full list of methods and options.

## Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run the tests (`npm test`) and the type check (`npm run typecheck`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

- Sebastien Moraz

## Links

- [GitHub Repository](https://github.com/Sebastien-Moraz/WynnSDK)
- [Issues](https://github.com/Sebastien-Moraz/WynnSDK/issues)
- [Wynncraft API documentation](https://docs.wynncraft.com/)

## Support

If you encounter any problems or have questions, please:
- Open an [issue](https://github.com/Sebastien-Moraz/WynnSDK/issues)
- Contact the author through GitHub
