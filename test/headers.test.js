import { describe, expect, test } from '@jest/globals';
import { cacheTtlFromHeaders, parseMaxAge, parseRetryAfter } from '../src/modules/headers.js';

const headers = (obj) => ({ get: (name) => obj[name.toLowerCase()] ?? null });

describe('headers helpers', () => {
	test('parseMaxAge', () => {
		expect(parseMaxAge('max-age=60')).toBe(60);
		expect(parseMaxAge('public, max-age=300')).toBe(300);
		expect(parseMaxAge('s-maxage=10, max-age=60')).toBe(60);
		expect(parseMaxAge('no-store')).toBe(0);
		expect(parseMaxAge(null)).toBe(0);
	});

	test('parseRetryAfter', () => {
		expect(parseRetryAfter('5')).toBe(5000);
		expect(parseRetryAfter(null)).toBeNull();
		expect(parseRetryAfter('garbage')).toBeNull();
		const future = new Date(Date.now() + 30000).toUTCString();
		expect(parseRetryAfter(future)).toBeGreaterThan(25000);
	});

	test('cacheTtlFromHeaders subtracts Age from max-age', () => {
		expect(cacheTtlFromHeaders(headers({ 'cache-control': 'max-age=60' }))).toBe(60);
		expect(cacheTtlFromHeaders(headers({ 'cache-control': 'max-age=60', 'age': '10' }))).toBe(50);
		expect(cacheTtlFromHeaders(headers({ 'cache-control': 'max-age=60', 'age': '120' }))).toBe(-60);
		expect(cacheTtlFromHeaders(headers({}))).toBe(0);
		expect(cacheTtlFromHeaders(undefined)).toBe(0);
	});
});
