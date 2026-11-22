/**
 * Encode a value to be used as a single URL path segment or query value.
 * Prevents path traversal ("../"), query injection ("?", "&") and fragment injection ("#").
 * @param value {string|number}
 * @param name {string} Parameter name used in error messages
 * @returns {string}
 */
export function enc(value, name = 'parameter') {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return String(value);
	}
	if (typeof value !== 'string' || value.trim() === '') {
		throw new TypeError(`${name} must be a non-empty string`);
	}
	return encodeURIComponent(value);
}

/**
 * Ensure a value belongs to an allowed list.
 * @template T
 * @param value {T}
 * @param allowed {T[]}
 * @param name {string}
 * @returns {T}
 */
export function oneOf(value, allowed, name = 'parameter') {
	if (!allowed.includes(value)) {
		throw new TypeError(`${name} must be one of: ${allowed.join(', ')}`);
	}
	return value;
}
