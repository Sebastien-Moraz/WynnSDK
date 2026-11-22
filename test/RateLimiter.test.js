import { afterEach, describe, expect, jest, test } from '@jest/globals';
import RateLimiter from '../src/modules/RateLimiter.js';

const headers = (obj) => ({ get: (name) => obj[name.toLowerCase()] ?? null });

describe('RateLimiter', () => {
	afterEach(() => jest.useRealTimers());

	test('classifies API paths into buckets', () => {
		expect(RateLimiter.bucketFor('/player/x')).toBe('PLAYER');
		expect(RateLimiter.bucketFor('/guild/x')).toBe('GUILD');
		expect(RateLimiter.bucketFor('/item/search/x')).toBe('ITEMS');
		expect(RateLimiter.bucketFor('/leaderboards/x')).toBe('LEADERBOARDS');
		expect(RateLimiter.bucketFor('/map/quests')).toBe('MAP');
		expect(RateLimiter.bucketFor('/search/x')).toBe('SHARED');
		expect(RateLimiter.bucketFor('/player?identifier=uuid')).toBe('SHARED');
	});

	test('acquire resolves immediately while under the limit', async () => {
		const limiter = new RateLimiter(2);
		await limiter.acquire('SHARED');
		await limiter.acquire('SHARED');
		expect(limiter.timestamps.SHARED).toHaveLength(2);
	});

	test('acquire waits for the window to free a slot', async () => {
		jest.useFakeTimers();
		const now = Date.now();
		jest.setSystemTime(now);
		const limiter = new RateLimiter(120);
		for (let i = 0; i < 120; i++) limiter.timestamps.SHARED.push(now - 30000);

		let acquired = false;
		const promise = limiter.acquire('SHARED').then(() => { acquired = true; });
		await jest.advanceTimersByTimeAsync(1000);
		expect(acquired).toBe(false);

		await jest.advanceTimersByTimeAsync(35000);
		await promise;
		expect(acquired).toBe(true);
	});

	test('buckets are independent', async () => {
		const limiter = new RateLimiter(1);
		await limiter.acquire('PLAYER');
		await limiter.acquire('GUILD');
		expect(limiter.timestamps.PLAYER).toHaveLength(1);
		expect(limiter.timestamps.GUILD).toHaveLength(1);
	});

	test('sync updates only the bucket reported by the API', () => {
		const limiter = new RateLimiter(50);
		limiter.sync(headers({
			'ratelimit-bucket': 'player',
			'ratelimit-limit': '80',
			'ratelimit-remaining': '79',
			'ratelimit-reset': '60'
		}), 'SHARED');
		expect(limiter.limits.PLAYER).toBe(80);
		expect(limiter.limits.SHARED).toBe(50);
	});

	test('sync reserves requests consumed by other clients', () => {
		const limiter = new RateLimiter(50);
		limiter.sync(headers({
			'ratelimit-limit': '50',
			'ratelimit-remaining': '40',
			'ratelimit-reset': '30'
		}), 'GUILD');
		expect(limiter.timestamps.GUILD).toHaveLength(10);
	});

	test('sync ignores incomplete or unknown headers', () => {
		const limiter = new RateLimiter(50);
		limiter.sync(headers({ 'ratelimit-limit': '10' }), 'SHARED');
		limiter.sync(headers({
			'ratelimit-bucket': 'unknown',
			'ratelimit-limit': '10',
			'ratelimit-remaining': '1',
			'ratelimit-reset': '1'
		}), 'SHARED');
		limiter.sync(undefined, 'SHARED');
		expect(limiter.limits.SHARED).toBe(50);
	});
});
