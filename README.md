<img src="https://koppa.pro/dl/WynnSDK.png" alt="WynnSDK" width="350" style="border-radius: 10px; margin: 20px auto; display: block;">

# WynnSDK
[![NPM Version](https://img.shields.io/npm/v/wynnsdk.svg)](https://www.npmjs.com/package/wynnsdk)
[![NPM Downloads](https://img.shields.io/npm/dt/wynnsdk.svg)](https://www.npmjs.com/package/wynnsdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Unofficial SDK for the Wynncraft API with built-in caching support (Fruma update supported)

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
const playerLiveData = await sdk.getPlayerLocations();
```

## Caching System

WynnSDK implements an intelligent caching system to:
- Respect Wynncraft API rate limits
- Reduce API calls for frequently requested data
- Improve response times

Cache durations:

The cache duration is automaticly determinate with header of the request.

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