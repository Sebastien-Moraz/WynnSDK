export const BUCKETS = ['SHARED', 'PLAYER', 'GUILD', 'ITEMS', 'LEADERBOARDS', 'MAP'];
export const WINDOW_MS = 60000;

const BUCKET_PREFIXES = [
	['/player/', 'PLAYER'],
	['/guild/', 'GUILD'],
	['/item/', 'ITEMS'],
	['/leaderboards/', 'LEADERBOARDS'],
	['/map/', 'MAP'],
];

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Client-side sliding-window rate limiter, one window per Wynncraft API bucket,
 * kept in sync with the `ratelimit-*` response headers.
 */
export default class RateLimiter {
	/**
	 * @param defaultLimit {number} Requests per minute allowed in each bucket
	 */
	constructor(defaultLimit) {
		this.limits = {};
		this.timestamps = {};
		for (const bucket of BUCKETS) {
			this.limits[bucket] = defaultLimit;
			this.timestamps[bucket] = [];
		}
	}

	/**
	 * Find the bucket of an API path (relative to the API base URL).
	 * @param path {string}
	 * @returns {string}
	 */
	static bucketFor(path) {
		const match = BUCKET_PREFIXES.find(([prefix]) => path.startsWith(prefix));
		return match ? match[1] : 'SHARED';
	}

	#prune(bucket, now) {
		this.timestamps[bucket] = this.timestamps[bucket].filter(time => now - time < WINDOW_MS);
	}

	/**
	 * Wait until a request can be sent in the bucket, then reserve the slot.
	 * @param bucket {string}
	 */
	async acquire(bucket) {
		while (true) {
			const now = Date.now();
			this.#prune(bucket, now);
			if (this.timestamps[bucket].length < this.limits[bucket]) {
				this.timestamps[bucket].push(now);
				return;
			}
			const oldest = this.timestamps[bucket][0];
			await sleep(WINDOW_MS - (now - oldest) + 100);
		}
	}

	/**
	 * Align the local state with the rate limit headers returned by the API.
	 * @param headers {{get(name: string): string|null}|undefined}
	 * @param fallbackBucket {string} Bucket used when the API does not report one
	 */
	sync(headers, fallbackBucket) {
		const bucket = headers?.get('ratelimit-bucket')?.toUpperCase() ?? fallbackBucket;
		const remaining = parseInt(headers?.get('ratelimit-remaining'), 10);
		const reset = parseInt(headers?.get('ratelimit-reset'), 10);
		const limit = parseInt(headers?.get('ratelimit-limit'), 10);

		if (!this.timestamps[bucket] || ![remaining, reset, limit].every(Number.isFinite)) {
			return;
		}

		this.limits[bucket] = limit;

		const now = Date.now();
		this.#prune(bucket, now);
		const gap = (limit - this.timestamps[bucket].length) - remaining;
		if (gap > 0) {
			// Other clients consumed requests: reserve them until the API window resets.
			const fakeTimestamp = now - (WINDOW_MS - reset * 1000);
			for (let i = 0; i < gap; i++) {
				this.timestamps[bucket].push(fakeTimestamp);
			}
			this.timestamps[bucket].sort((a, b) => a - b);
		}
	}
}
