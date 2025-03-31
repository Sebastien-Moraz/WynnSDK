# WynnSDK

An unofficial JavaScript SDK for the Wynncraft API, providing easy access to Wynncraft game data with built-in caching support.

## Installation

```bash
npm install wynnsdk
```

## Features

- 🚀 Easy-to-use wrapper for the Wynncraft API
- 💾 Built-in caching system to respect API rate limits
- ⚡ Promise-based async/await support

## Usage

```javascript
import { WynnSDK } from 'wynnsdk';

// Initialize the SDK
const sdk = new WynnSDK();

// Get player information
const playerInfo = await sdk.getPlayer('PlayerName');

// Get guild information
const guildInfo = await sdk.getGuild('GuildName');

// Get item information
const itemInfo = await sdk.searchItem('Legendary Spear');

// Get live player and guild, party, friend locations
const territories = await sdk.getPlayerLocations();
```

## Caching System

WynnSDK implements an intelligent caching system to:
- Respect Wynncraft API rate limits
- Reduce API calls for frequently requested data
- Improve response times

Cache durations:
- Player data: 60 seconds
- Guild data: 120 seconds
- Server list: 30 seconds
- Item data: 24 hours
- Territory data: 30 seconds

The cache is automatically managed, but you can force a fresh API call when needed:

```javascript
// Force fresh data from API
const freshPlayerData = await sdk.getPlayer('PlayerName', { forceFresh: true });
```

## Documentation

Full documentation will be available soon.

## Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

- Sebastien Moraz

## Links

- [GitHub Repository](https://github.com/Sebastien-Moraz/WynnSDK)
- [Issues](https://github.com/Sebastien-Moraz/WynnSDK/issues)

## Support

If you encounter any problems or have questions, please:
- Open an [issue](https://github.com/Sebastien-Moraz/WynnSDK/issues)
- Contact the author through GitHub 