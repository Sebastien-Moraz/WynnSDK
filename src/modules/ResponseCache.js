const DEFAULT_MAX_ENTRIES = 500;
const DEFAULT_SWEEP_THRESHOLD = 100;

/**
 * In-memory TTL cache. Values are deep-copied on read so callers cannot mutate cached data.
 */
export default class ResponseCache {
	constructor({ maxEntries = DEFAULT_MAX_ENTRIES, sweepThreshold = DEFAULT_SWEEP_THRESHOLD } = {}) {
		this.maxEntries = maxEntries;
		this.sweepThreshold = sweepThreshold;
		/** @type {Map<string, {data: any, expires: number}>} */
		this.entries = new Map();
	}

	get size() {
		return this.entries.size;
	}

	/**
	 * @param key {string}
	 * @returns {{hit: boolean, data?: any}} A copy of the cached value when present and fresh
	 */
	get(key) {
		if (this.entries.size > this.sweepThreshold) {
			this.sweep();
		}
		const entry = this.entries.get(key);
		if (!entry) return { hit: false };
		if (entry.expires <= Date.now()) {
			this.entries.delete(key);
			return { hit: false };
		}
		return { hit: true, data: structuredClone(entry.data) };
	}

	/**
	 * @param key {string}
	 * @param data {any}
	 * @param ttlSeconds {number} Nothing is stored when ttl <= 0
	 */
	set(key, data, ttlSeconds) {
		if (!(ttlSeconds > 0)) return;
		this.entries.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
	}

	has(key) {
		return this.entries.has(key);
	}

	clear() {
		this.entries.clear();
	}

	/** Remove expired entries, then the oldest ones above maxEntries. */
	sweep() {
		const now = Date.now();
		for (const [key, value] of this.entries) {
			if (value.expires <= now) this.entries.delete(key);
		}

		let excess = this.entries.size - this.maxEntries;
		for (const key of this.entries.keys()) {
			if (excess-- <= 0) break;
			this.entries.delete(key);
		}
	}
}
