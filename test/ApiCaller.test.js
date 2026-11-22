import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import ApiCaller from '../src/modules/ApiCaller.js';
import WynnApiError from '../src/modules/WynnApiError.js';

const headersFrom = (obj = {}) => ({
	get: jest.fn((name) => {
		const key = Object.keys(obj).find(k => k.toLowerCase() === name.toLowerCase());
		return key === undefined ? null : obj[key];
	})
});

const okResponse = (data, headers = {}) => ({
	status: 200,
	statusText: 'OK',
	ok: true,
	json: jest.fn().mockResolvedValue(data),
	headers: headersFrom(headers)
});

describe('ApiCaller', () => {
	let fetchMock;
	let apiCaller;

	beforeEach(() => {
		fetchMock = jest.fn();
		apiCaller = new ApiCaller({ fetch: fetchMock });
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('construction', () => {
		test('instances are independent (no shared token or cache)', () => {
			const a = new ApiCaller({ token: 'secret', fetch: fetchMock });
			const b = new ApiCaller({ fetch: fetchMock });
			a.cache.set('url', 1, 10);

			expect(a.headers['Authorization']).toBe('Bearer secret');
			expect(b.headers['Authorization']).toBeUndefined();
			expect(b.cache.has('url')).toBe(false);
			expect(a.rateLimiter.limits.SHARED).toBe(120);
			expect(b.rateLimiter.limits.SHARED).toBe(50);
		});

		test('does not send a Content-Type header on GET requests', () => {
			expect(apiCaller.headers['Content-Type']).toBeUndefined();
		});
	});

	describe('request', () => {
		test('fetches and returns data successfully', async () => {
			const mockData = { data: 'test' };
			fetchMock.mockResolvedValue(okResponse(mockData));

			const result = await apiCaller.request('http://test.url');
			expect(fetchMock).toHaveBeenCalledWith('http://test.url', expect.objectContaining({ method: 'GET', signal: expect.any(AbortSignal) }));
			expect(result).toEqual(mockData);
		});

		test('returns cached data if available and not expired', async () => {
			const cachedData = { cached: true };
			apiCaller.cache.set('http://test.url', cachedData, 10);

			const result = await apiCaller.request('http://test.url');
			expect(fetchMock).not.toHaveBeenCalled();
			expect(result).toEqual(cachedData);
		});

		test('returned data is a copy: mutating it does not alter the cache', async () => {
			apiCaller.cache.set('http://test.url', { a: 1 }, 10);

			const first = await apiCaller.request('http://test.url');
			first.a = 999;
			first.extra = true;

			const second = await apiCaller.request('http://test.url');
			expect(second).toEqual({ a: 1 });
		});

		test('clears cache and fetches if cache is expired', async () => {
			const mockData = { fresh: true };
			apiCaller.cache.entries.set('http://test.url', { data: { cached: true }, expires: Date.now() - 10000 });
			fetchMock.mockResolvedValue(okResponse(mockData));

			const result = await apiCaller.request('http://test.url');
			expect(fetchMock).toHaveBeenCalled();
			expect(result).toEqual(mockData);
			expect(apiCaller.cache.has('http://test.url')).toBe(false);
		});

		test('deduplicates concurrent identical requests', async () => {
			fetchMock.mockResolvedValue(okResponse({ ok: 1 }));

			const [a, b] = await Promise.all([
				apiCaller.request('http://test.url'),
				apiCaller.request('http://test.url')
			]);
			expect(fetchMock).toHaveBeenCalledTimes(1);
			expect(a).toEqual({ ok: 1 });
			expect(b).toEqual({ ok: 1 });
			expect(a).not.toBe(b);
		});

		test('throws a WynnApiError with status and body if response is not ok', async () => {
			fetchMock.mockResolvedValue({
				status: 404,
				statusText: 'Not Found',
				ok: false,
				json: jest.fn().mockResolvedValue({ Error: 'Custom Error Message' }),
				headers: headersFrom()
			});

			const error = await apiCaller.request('http://test.url').catch(e => e);
			expect(error).toBeInstanceOf(WynnApiError);
			expect(error.message).toBe('404 Not Found: Custom Error Message');
			expect(error.status).toBe(404);
			expect(error.url).toBe('http://test.url');
			expect(error.body).toEqual({ Error: 'Custom Error Message' });
		});

		test('wraps network errors in a WynnApiError', async () => {
			fetchMock.mockRejectedValue(new TypeError('fetch failed'));

			const error = await apiCaller.request('http://test.url').catch(e => e);
			expect(error).toBeInstanceOf(WynnApiError);
			expect(error.status).toBeNull();
			expect(error.message).toContain('fetch failed');
		});

		test('reports timeouts explicitly', async () => {
			const timeoutError = new DOMException('The operation was aborted due to timeout', 'TimeoutError');
			fetchMock.mockRejectedValue(timeoutError);

			await expect(apiCaller.request('http://test.url')).rejects.toThrow('Request timed out after 10000ms');
		});

		test('does not log requests by default', async () => {
			const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});
			const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
			fetchMock.mockResolvedValue(okResponse({}));

			await apiCaller.request('http://test.url');
			expect(spy).not.toHaveBeenCalled();
			expect(logSpy).not.toHaveBeenCalled();
			spy.mockRestore();
			logSpy.mockRestore();
		});

		test('logs requests when debug is enabled', async () => {
			const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});
			const debugCaller = new ApiCaller({ fetch: fetchMock, debug: true });
			fetchMock.mockResolvedValue(okResponse({}));

			await debugCaller.request('http://test.url');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		test('caches response if cacheTime option is provided', async () => {
			const mockData = { data: 'test' };
			fetchMock.mockResolvedValue(okResponse(mockData));

			await apiCaller.request('http://test.url', { cacheTime: 10 });
			expect(apiCaller.cache.get('http://test.url').data).toEqual(mockData);
		});

		test('caches response using cache-control header', async () => {
			fetchMock.mockResolvedValue(okResponse({}, { 'cache-control': 'public, max-age=60' }));

			await apiCaller.request('http://test.url');
			expect(apiCaller.cache.has('http://test.url')).toBe(true);
		});

		test('subtracts the Age header from max-age', async () => {
			jest.useFakeTimers();
			const now = Date.now();
			jest.setSystemTime(now);
			fetchMock.mockResolvedValue(okResponse({}, { 'cache-control': 'max-age=60', 'age': '10' }));

			await apiCaller.request('http://test.url');
			expect(apiCaller.cache.entries.get('http://test.url').expires).toBe(now + 50000);
		});

		test('does not cache when Age exceeds max-age', async () => {
			fetchMock.mockResolvedValue(okResponse({}, { 'cache-control': 'max-age=60', 'age': '120' }));

			await apiCaller.request('http://test.url');
			expect(apiCaller.cache.has('http://test.url')).toBe(false);
		});

		test('clearCache empties the cache', () => {
			apiCaller.cache.set('url', 1, 10);
			apiCaller.clearCache();
			expect(apiCaller.cache.size).toBe(0);
		});
	});

	describe('rate limiting', () => {
		test('retries after 429 without Retry-After (60s default)', async () => {
			jest.useFakeTimers();
			fetchMock
				.mockResolvedValueOnce({ status: 429, ok: false, headers: headersFrom() })
				.mockResolvedValueOnce(okResponse({ success: true }));

			const promise = apiCaller.request('http://test.url');
			await jest.advanceTimersByTimeAsync(65000);

			await expect(promise).resolves.toEqual({ success: true });
			expect(fetchMock).toHaveBeenCalledTimes(2);
		});

		test('retries after 429 using Retry-After seconds', async () => {
			jest.useFakeTimers();
			fetchMock
				.mockResolvedValueOnce({ status: 429, ok: false, headers: headersFrom({ 'Retry-After': '2' }) })
				.mockResolvedValueOnce(okResponse({ success: true }));

			const promise = apiCaller.request('http://test.url');
			await jest.advanceTimersByTimeAsync(3500);

			await expect(promise).resolves.toEqual({ success: true });
			expect(fetchMock).toHaveBeenCalledTimes(2);
		});

		test('does not hot-loop on a non-numeric Retry-After', async () => {
			jest.useFakeTimers();
			fetchMock
				.mockResolvedValueOnce({ status: 429, ok: false, headers: headersFrom({ 'Retry-After': 'garbage' }) })
				.mockResolvedValueOnce(okResponse({ success: true }));

			const promise = apiCaller.request('http://test.url');
			await jest.advanceTimersByTimeAsync(5000);
			expect(fetchMock).toHaveBeenCalledTimes(1);

			await jest.advanceTimersByTimeAsync(60000);
			await expect(promise).resolves.toEqual({ success: true });
		});

		test('gives up after maxRetries 429 responses', async () => {
			jest.useFakeTimers();
			const caller = new ApiCaller({ fetch: fetchMock, maxRetries: 2 });
			fetchMock.mockResolvedValue({ status: 429, ok: false, headers: headersFrom({ 'Retry-After': '1' }) });

			const promise = caller.request('http://test.url').catch(e => e);
			await jest.advanceTimersByTimeAsync(10000);

			const error = await promise;
			expect(error).toBeInstanceOf(WynnApiError);
			expect(error.status).toBe(429);
			expect(fetchMock).toHaveBeenCalledTimes(3);
		});

		test('uses the bucket of the requested API path', async () => {
			fetchMock.mockResolvedValue(okResponse({}));
			await apiCaller.request(`${apiCaller.url}/guild/x`);
			expect(apiCaller.rateLimiter.timestamps.GUILD).toHaveLength(1);
			expect(apiCaller.rateLimiter.timestamps.SHARED).toHaveLength(0);
		});

		test('respects internal rate limit', async () => {
			jest.useFakeTimers();
			const now = Date.now();
			jest.setSystemTime(now);
			apiCaller.rateLimiter.limits.SHARED = 120;
			for (let i = 0; i < 120; i++) {
				apiCaller.rateLimiter.timestamps.SHARED.push(now - 30000);
			}
			fetchMock.mockResolvedValue(okResponse({ success: true }));

			const promise = apiCaller.request('http://test.url');
			await jest.advanceTimersByTimeAsync(1000);
			expect(fetchMock).not.toHaveBeenCalled();

			await jest.advanceTimersByTimeAsync(35000);
			await expect(promise).resolves.toEqual({ success: true });
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		test('updates the limit of the bucket reported by the API only', async () => {
			fetchMock.mockResolvedValue(okResponse({}, {
				'ratelimit-bucket': 'player',
				'ratelimit-limit': '80',
				'ratelimit-remaining': '79',
				'ratelimit-reset': '60'
			}));

			await apiCaller.request(`${apiCaller.url}/player/Salted`);
			expect(apiCaller.rateLimiter.limits.PLAYER).toBe(80);
			expect(apiCaller.rateLimiter.limits.GUILD).toBe(50);
		});
	});
});
