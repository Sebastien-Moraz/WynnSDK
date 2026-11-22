/**
 * Error thrown by WynnSDK when a request to the Wynncraft API fails.
 */
export default class WynnApiError extends Error {
	/**
	 * @param message {string}
	 * @param details {{url?: string, status?: number|null, body?: any, cause?: unknown}}
	 */
	constructor(message, { url = null, status = null, body = null, cause } = {}) {
		super(message, cause === undefined ? undefined : { cause });
		this.name = 'WynnApiError';
		/** @type {string|null} */
		this.url = url;
		/** HTTP status code, or null for network errors / timeouts */
		this.status = status;
		/** Parsed JSON error body returned by the API, if any */
		this.body = body;
	}
}
