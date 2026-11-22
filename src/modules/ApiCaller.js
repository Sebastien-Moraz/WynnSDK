import WynnApiError from "./WynnApiError.js";
import { VERSION } from "../version.js";

const BUCKETS = ['SHARED', 'PLAYER', 'GUILD', 'ITEMS', 'LEADERBOARDS', 'MAP'];
const WINDOW_MS = 60000;
const MAX_CACHE_ENTRIES = 500;
const SWEEP_THRESHOLD = 100;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Parse a Retry-After header (delta-seconds or HTTP-date) into milliseconds.
 * @param value {string|null}
 * @returns {number|null}
 */
export function parseRetryAfter(value) {
	if (!value) return null;
	const seconds = Number(value);
	if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
	const date = Date.parse(value);
	if (Number.isFinite(date)) return Math.max(0, date - Date.now());
	return null;
}

/**
 * Extract max-age (in seconds) from a Cache-Control header.
 * @param value {string|null}
 * @returns {number}
 */
export function parseMaxAge(value) {
	if (!value) return 0;
	if (/no-store|no-cache/i.test(value)) return 0;
	const match = /(?:^|[,\s])max-age=(\d+)/i.exec(value);
	return match ? parseInt(match[1], 10) : 0;
}

export default class ApiCaller {
	/**
	 * @param options {Object}
	 * @param options.token {string|null} Wynncraft API token
	 * @param options.timeout {number} Request timeout in ms (default 10000)
	 * @param options.maxRetries {number} Max retries on HTTP 429 (default 3)
	 * @param options.debug {boolean} Log each request to the console (default false)
	 * @param options.fetch {Function} Custom fetch implementation (default globalThis.fetch)
	 */
	constructor({ token = null, timeout = 10000, maxRetries = 3, debug = false, fetch = globalThis.fetch } = {}) {
		if (typeof fetch !== 'function') {
			throw new Error('No fetch implementation available. WynnSDK requires Node.js >= 22.');
		}
		this.url = 'https://api.wynncraft.com/v3';
		this.timeout = timeout;
		this.maxRetries = maxRetries;
		this.debug = debug;
		this.fetch = fetch;
		this.headers = {
			'Accept': 'application/json',
			'User-Agent': 'WynnSDK/' + VERSION,
		};
		if (token) {
			this.headers['Authorization'] = 'Bearer ' + token;
		}
		this.defaultRateLimit = token ? 120 : 50;
		this.rateLimits = {};
		this.requestTimestamps = {};
		for (const bucket of BUCKETS) {
			this.rateLimits[bucket] = this.defaultRateLimit;
			this.requestTimestamps[bucket] = [];
		}
		this.cache = new Map();
		this.inFlight = new Map();
	}

	sweepCache() {
		const now = Date.now();
		for (const [key, value] of this.cache.entries()) {
			if (value.expires <= now) {
				this.cache.delete(key);
			}
		}

		if (this.cache.size > MAX_CACHE_ENTRIES) {
			const keysToDelete = this.cache.size - MAX_CACHE_ENTRIES;
			let i = 0;
			for (const key of this.cache.keys()) {
				if (i++ >= keysToDelete) break;
				this.cache.delete(key);
			}
		}
	}

	/** Remove every cached response. */
	clearCache() {
		this.cache.clear();
	}

	getBucket(url) {
		if (url.startsWith(this.url)) {
			const path = url.slice(this.url.length);
			if (path.startsWith('/player/')) return 'PLAYER';
			if (path.startsWith('/guild/')) return 'GUILD';
			if (path.startsWith('/item/')) return 'ITEMS';
			if (path.startsWith('/leaderboards/')) return 'LEADERBOARDS';
			if (path.startsWith('/map/')) return 'MAP';
		}
		return 'SHARED';
	}

	/**
	 * Perform a GET request with caching and rate limiting.
	 * Returned data is a copy: mutating it does not affect the cache.
	 * @param url {string}
	 * @param options {{cacheTime?: number}}
	 * @returns {Promise<any>}
	 */
	async request(url, options = {}) {
		if (this.cache.size > SWEEP_THRESHOLD) {
			this.sweepCache();
		}

		const cached = this.cache.get(url);
		if (cached) {
			if (cached.expires > Date.now()) {
				return structuredClone(cached.data);
			}
			this.cache.delete(url);
		}

		// Deduplicate identical concurrent requests
		let pending = this.inFlight.get(url);
		if (!pending) {
			pending = this.#fetchAndCache(url, options).finally(() => this.inFlight.delete(url));
			this.inFlight.set(url, pending);
		}
		return structuredClone(await pending);
	}

	async #waitForSlot(bucket) {
		while (true) {
			const now = Date.now();
			this.requestTimestamps[bucket] = this.requestTimestamps[bucket].filter(time => now - time < WINDOW_MS);
			if (this.requestTimestamps[bucket].length < this.rateLimits[bucket]) {
				this.requestTimestamps[bucket].push(now);
				return;
			}
			const oldest = this.requestTimestamps[bucket][0];
			await sleep(WINDOW_MS - (now - oldest) + 100);
		}
	}

	#syncRateLimit(response, bucket) {
		const headerBucket = response.headers?.get('ratelimit-bucket');
		const rBucket = headerBucket ? headerBucket.toUpperCase() : bucket;
		const remaining = parseInt(response.headers?.get('ratelimit-remaining'), 10);
		const reset = parseInt(response.headers?.get('ratelimit-reset'), 10);
		const limit = parseInt(response.headers?.get('ratelimit-limit'), 10);

		if (!this.requestTimestamps[rBucket] || ![remaining, reset, limit].every(Number.isFinite)) {
			return;
		}

		this.rateLimits[rBucket] = limit;

		const now = Date.now();
		this.requestTimestamps[rBucket] = this.requestTimestamps[rBucket].filter(time => now - time < WINDOW_MS);
		const localRemaining = limit - this.requestTimestamps[rBucket].length;

		if (remaining < localRemaining) {
			const gap = localRemaining - remaining;
			const fakeTimestamp = now - (WINDOW_MS - reset * 1000);
			for (let i = 0; i < gap; i++) {
				this.requestTimestamps[rBucket].push(fakeTimestamp);
			}
			this.requestTimestamps[rBucket].sort((a, b) => a - b);
		}
	}

	async #fetchAndCache(url, options) {
		const bucket = this.getBucket(url);

		for (let attempt = 0; ; attempt++) {
			await this.#waitForSlot(bucket);

			let response;
			try {
				response = await this.fetch(url, {
					method: 'GET',
					headers: this.headers,
					signal: AbortSignal.timeout(this.timeout),
				});
			} catch (e) {
				const reason = e?.name === 'TimeoutError' ? `Request timed out after ${this.timeout}ms` : `Network error: ${e?.message ?? e}`;
				throw new WynnApiError(reason, { url, cause: e });
			}

			this.#syncRateLimit(response, bucket);

			if (this.debug) {
				console.debug('[WynnSDK]', response.status, url,
					'remaining:', response.headers?.get('ratelimit-remaining'),
					'reset:', response.headers?.get('ratelimit-reset'));
			}

			if (response.status === 429) {
				if (attempt >= this.maxRetries) {
					throw new WynnApiError(`Rate limited (429) after ${attempt + 1} attempts`, { url, status: 429 });
				}
				const waitTime = parseRetryAfter(response.headers?.get('retry-after'))
					?? parseRetryAfter(response.headers?.get('ratelimit-reset'))
					?? WINDOW_MS;
				await sleep(waitTime + 1000);
				continue;
			}

			if (!response.ok) {
				let body = null;
				let message = 'Non-JSON error response';
				try {
					body = await response.json();
					message = body?.Error ?? body?.error ?? JSON.stringify(body);
				} catch {
					// keep default message
				}
				const status = [response.status, response.statusText].filter(Boolean).join(' ');
				throw new WynnApiError(`${status}: ${message}`, {
					url, status: response.status, body,
				});
			}

			let data;
			try {
				data = await response.json();
			} catch (e) {
				throw new WynnApiError(`${response.status}: Invalid JSON response`, { url, status: response.status, cause: e });
			}

			let cacheTime = 0;
			if (options.cacheTime) {
				cacheTime = options.cacheTime;
			} else {
				cacheTime = parseMaxAge(response.headers?.get('cache-control'));
				const age = parseInt(response.headers?.get('age'), 10);
				if (Number.isFinite(age)) cacheTime -= age;
			}
			if (cacheTime > 0) {
				this.cache.set(url, {
					data,
					expires: Date.now() + cacheTime * 1000,
				});
			}

			return data;
		}
	}
}
