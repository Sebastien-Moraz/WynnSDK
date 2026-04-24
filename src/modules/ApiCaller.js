import fetch from 'node-fetch';
import pkg from '../../package.json' with { type: 'json' };

export default class ApiCaller {
	static instance = null;
	static allowConstruction = false;
	static getInstance() {
		if (this.instance === null) {
			this.allowConstruction = true;
			this.instance = new ApiCaller();
		}
		return this.instance;
	}

	constructor() {
		if (!ApiCaller.allowConstruction) {
			throw new Error('This class is a singleton and cannot be instantiated directly.');
		}
		ApiCaller.allowConstruction = false;
		this.url = 'https://api.wynncraft.com/v3';
		this.rateLimit = 50;
		this.headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'User-Agent': 'WynnSDK/' + pkg.version,
		};
		this.cache = new Map();
		this.requestTimestamps = {
			SHARED: [],
			PLAYER: [],
			GUILD: [],
			ITEMS: [],
			LEADERBOARDS: [],
			MAP: []
		};
	}

	sweepCache() {
		const now = Date.now();
		for (const [key, value] of this.cache.entries()) {
			if (value.expires <= now) {
				this.cache.delete(key);
			}
		}

		if (this.cache.size > 500) {
			const keysToDelete = this.cache.size - 500;
			let i = 0;
			for (const key of this.cache.keys()) {
				if (i++ < keysToDelete) {
					this.cache.delete(key);
				} else {
					break;
				}
			}
		}
	}

	async request(url, options = {}) {
		if (this.cache.size > 100) {
			this.sweepCache();
		}

		if (this.cache.has(url)) {
			const cached = this.cache.get(url);
			if (cached.expires > Date.now()) {
				return cached.data;
			} else {
				this.cache.delete(url);
			}
		}

		let bucket = 'SHARED';
		if (url.startsWith(this.url)) {
			const path = url.slice(this.url.length);
			if (path.startsWith('/player/')) bucket = 'PLAYER';
			else if (path.startsWith('/guild/')) bucket = 'GUILD';
			else if (path.startsWith('/item/')) bucket = 'ITEMS';
			else if (path.startsWith('/leaderboards/')) bucket = 'LEADERBOARDS';
			else if (path.startsWith('/map/')) bucket = 'MAP';
		}

		while (true) {
			while (true) {
				const now = Date.now();
				this.requestTimestamps[bucket] = this.requestTimestamps[bucket].filter(time => now - time < 60000);
				if (this.requestTimestamps[bucket].length < this.rateLimit) {
					this.requestTimestamps[bucket].push(now);
					break;
				}
				const oldest = this.requestTimestamps[bucket][0];
				const waitTime = 60000 - (now - oldest) + 100;
				await new Promise(resolve => setTimeout(resolve, waitTime));
			}

			const response = await fetch(url, {
				method: 'GET',
				headers: this.headers
			});

			const rBucketHeader = response.headers?.get('ratelimit-bucket');
			const rBucket = rBucketHeader ? rBucketHeader.toUpperCase() : bucket;
			const rRemaining = response.headers?.get('ratelimit-remaining');
			const rReset = response.headers?.get('ratelimit-reset');
			const rLimit = response.headers?.get('ratelimit-limit');

			if (rBucket && rRemaining && rReset && rLimit) {
				const remaining = parseInt(rRemaining);
				const reset = parseInt(rReset);
				const limit = parseInt(rLimit);

				this.rateLimit = limit;

				if (this.requestTimestamps[rBucket]) {
					const now = Date.now();
					this.requestTimestamps[rBucket] = this.requestTimestamps[rBucket].filter(time => now - time < 60000);
					const localRemaining = limit - this.requestTimestamps[rBucket].length;

					if (remaining < localRemaining) {
						const gap = localRemaining - remaining;
						const fakeTimestamp = now - (60000 - reset * 1000);
						for (let i = 0; i < gap; i++) {
							this.requestTimestamps[rBucket].push(fakeTimestamp);
						}
						this.requestTimestamps[rBucket].sort((a, b) => a - b);
					}
				}
			}

			if (response.status === 429) {
				const retryAfter = response.headers?.get('Retry-After');
				let waitTime = 60000;
				if (retryAfter) {
					waitTime = (parseInt(retryAfter) * 1000) + 1000;
				} else if (rReset) {
					waitTime = (parseInt(rReset) * 1000) + 1000;
				}
				await new Promise(resolve => setTimeout(resolve, waitTime));
				continue;
			}

			if (!response.ok) {
				let errorMessage = "";
				try {
					const errorJson = await response.json();
					errorMessage = errorJson.Error || JSON.stringify(errorJson);
				} catch (e) {
					errorMessage = "Non-JSON error response";
				}
				throw new Error(`Error: ${response.status} ${response.statusText}: ${errorMessage}`);
			}

			let data;
			try {
				data = await response.json();
			} catch (e) {
				throw new Error(`Error: ${response.status} ${response.statusText}: Invalid JSON response`);
			}
			console.log("URL: ", url, "status", response.status, "remaining: ", rRemaining, "reset: ", rReset);
			let cacheTime = 0;
			if (options.cacheTime) {
				cacheTime = options.cacheTime;
			} else {
				cacheTime = response.headers?.get('cache-control');
				let age = response.headers?.get('Age');
				if (cacheTime) {
					cacheTime = parseInt(cacheTime.split('=')[1]);
					if (age) {
						cacheTime -= parseInt(age);
					}
				} else {
					cacheTime = 0;
				}
			}
			if (cacheTime > 0) {
				this.cache.set(url, {
					data: data,
					expires: Date.now() + cacheTime * 1000
				});
			}

			return data;
		}
	}

}