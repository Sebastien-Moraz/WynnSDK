import { afterEach, describe, expect, jest, test } from '@jest/globals';
import ResponseCache from '../src/modules/ResponseCache.js';

describe('ResponseCache', () => {
	afterEach(() => jest.useRealTimers());

	test('stores and returns values until they expire', () => {
		jest.useFakeTimers();
		const cache = new ResponseCache();
		cache.set('a', { v: 1 }, 10);

		expect(cache.get('a')).toEqual({ hit: true, data: { v: 1 } });
		jest.advanceTimersByTime(10001);
		expect(cache.get('a')).toEqual({ hit: false });
		expect(cache.has('a')).toBe(false);
	});

	test('does not store values with a non-positive TTL', () => {
		const cache = new ResponseCache();
		cache.set('a', 1, 0);
		cache.set('b', 1, -5);
		cache.set('c', 1, NaN);
		expect(cache.size).toBe(0);
	});

	test('returns copies so callers cannot mutate cached data', () => {
		const cache = new ResponseCache();
		cache.set('a', { v: 1 }, 10);
		cache.get('a').data.v = 999;
		expect(cache.get('a').data).toEqual({ v: 1 });
	});

	test('sweep removes expired entries', () => {
		const cache = new ResponseCache();
		cache.entries.set('old', { data: 1, expires: Date.now() - 1000 });
		cache.set('new', 2, 10);
		cache.sweep();
		expect(cache.has('old')).toBe(false);
		expect(cache.has('new')).toBe(true);
	});

	test('sweep removes the oldest entries above maxEntries', () => {
		const cache = new ResponseCache();
		for (let i = 0; i < 600; i++) cache.set(`url${i}`, i, 10);
		cache.sweep();
		expect(cache.size).toBe(500);
		expect(cache.has('url99')).toBe(false);
		expect(cache.has('url100')).toBe(true);
	});

	test('get sweeps only above the threshold', () => {
		const cache = new ResponseCache();
		const spy = jest.spyOn(cache, 'sweep');
		for (let i = 0; i < 100; i++) cache.set(`url${i}`, i, 10);
		cache.get('x');
		expect(spy).not.toHaveBeenCalled();
		cache.set('url100', 100, 10);
		cache.get('x');
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('clear empties the cache', () => {
		const cache = new ResponseCache();
		cache.set('a', 1, 10);
		cache.clear();
		expect(cache.size).toBe(0);
	});
});
