import WynnApiError from "./WynnApiError.js";
import ResponseCache from "./ResponseCache.js";
import RateLimiter, { WINDOW_MS, sleep } from "./RateLimiter.js";
import { cacheTtlFromHeaders, parseRetryAfter } from "./headers.js";
import { VERSION } from "../version.js";

export const API_URL = 'https://api.wynncraft.com/v3';

/**
 * HTTP client for the Wynncraft API: authentication, caching, rate limiting,
 * retries on 429, timeouts and error normalisation.
 */
export default class ApiCaller {
	/**
	 * @param options {Object}
	 * @param options.token {string|null} Wynncraft API token
	 * @param options.timeout {number} Request timeout in ms (default 10000)
	 * @param options.maxRetries {number} Max retries on HTTP 429 (default 3)
	 * @param options.debug {boolean} Log each request with console.debug (default false)
	 * @param options.fetch {Function} Custom fetch implementation (default globalThis.fetch)
	 */
	constructor({ token = null, timeout = 10000, maxRetries = 3, debug = false, fetch = globalThis.fetch } = {}) {
		if (typeof fetch !== 'function') {
			throw new Error('No fetch implementation available. WynnSDK requires Node.js >= 22.');
		}
		this.url = API_URL;
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
		this.rateLimiter = new RateLimiter(token ? 120 : 50);
		this.cache = new ResponseCache();
		/** @type {Map<string, Promise<any>>} */
		this.inFlight = new Map();
	}

	/** Remove every cached response. */
	clearCache() {
		this.cache.clear();
	}

	/**
	 * Perform a GET request with caching, deduplication and rate limiting.
	 * Returned data is a copy: mutating it does not affect the cache.
	 * @param url {string}
	 * @param options {{cacheTime?: number}} cacheTime overrides the Cache-Control TTL (seconds)
	 * @returns {Promise<any>}
	 */
	async request(url, options = {}) {
		const cached = this.cache.get(url);
		if (cached.hit) {
			return cached.data;
		}

		let pending = this.inFlight.get(url);
		if (!pending) {
			pending = this.#fetchWithRetry(url).then(({ data, headers }) => {
				this.cache.set(url, data, options.cacheTime || cacheTtlFromHeaders(headers));
				return data;
			}).finally(() => this.inFlight.delete(url));
			this.inFlight.set(url, pending);
		}
		return structuredClone(await pending);
	}

	#bucketFor(url) {
		return url.startsWith(this.url) ? RateLimiter.bucketFor(url.slice(this.url.length)) : 'SHARED';
	}

	async #fetchWithRetry(url) {
		const bucket = this.#bucketFor(url);

		for (let attempt = 0; ; attempt++) {
			await this.rateLimiter.acquire(bucket);
			const response = await this.#send(url);
			this.rateLimiter.sync(response.headers, bucket);

			if (response.status !== 429) {
				return { data: await this.#parse(url, response), headers: response.headers };
			}
			if (attempt >= this.maxRetries) {
				throw new WynnApiError(`Rate limited (429) after ${attempt + 1} attempts`, { url, status: 429 });
			}
			const waitTime = parseRetryAfter(response.headers?.get('retry-after'))
				?? parseRetryAfter(response.headers?.get('ratelimit-reset'))
				?? WINDOW_MS;
			await sleep(waitTime + 1000);
		}
	}

	async #send(url) {
		let response;
		try {
			response = await this.fetch(url, {
				method: 'GET',
				headers: this.headers,
				signal: AbortSignal.timeout(this.timeout),
			});
		} catch (e) {
			const reason = e?.name === 'TimeoutError'
				? `Request timed out after ${this.timeout}ms`
				: `Network error: ${e?.message ?? e}`;
			throw new WynnApiError(reason, { url, cause: e });
		}

		if (this.debug) {
			console.debug('[WynnSDK]', response.status, url,
				'remaining:', response.headers?.get('ratelimit-remaining'),
				'reset:', response.headers?.get('ratelimit-reset'));
		}
		return response;
	}

	async #parse(url, response) {
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
			throw new WynnApiError(`${status}: ${message}`, { url, status: response.status, body });
		}

		try {
			return await response.json();
		} catch (e) {
			throw new WynnApiError(`${response.status}: Invalid JSON response`, { url, status: response.status, cause: e });
		}
	}
}
