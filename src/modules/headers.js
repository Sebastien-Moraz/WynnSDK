/**
 * Parse a Retry-After header (delta-seconds or HTTP-date) into milliseconds.
 * @param value {string|null|undefined}
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
 * @param value {string|null|undefined}
 * @returns {number}
 */
export function parseMaxAge(value) {
	if (!value) return 0;
	if (/no-store|no-cache/i.test(value)) return 0;
	const match = /(?:^|[,\s])max-age=(\d+)/i.exec(value);
	return match ? parseInt(match[1], 10) : 0;
}

/**
 * Compute how long (in seconds) a response may be cached, from Cache-Control and Age.
 * @param headers {{get(name: string): string|null}|undefined}
 * @returns {number}
 */
export function cacheTtlFromHeaders(headers) {
	const maxAge = parseMaxAge(headers?.get('cache-control'));
	const age = parseInt(headers?.get('age'), 10);
	return Number.isFinite(age) ? maxAge - age : maxAge;
}
