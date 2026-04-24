import { beforeEach, afterEach, describe, expect, jest, test } from '@jest/globals';

const fetchMock = jest.fn();
jest.unstable_mockModule('node-fetch', () => ({ default: fetchMock }));

const { default: ApiCaller } = await import('../src/modules/ApiCaller.js');

describe('ApiCaller', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		ApiCaller.instance = null;
		ApiCaller.allowConstruction = false;
	});

	describe('Singleton', () => {
		test('getInstance creates and returns the singleton instance', () => {
			const instance1 = ApiCaller.getInstance();
			expect(instance1).toBeInstanceOf(ApiCaller);
			const instance2 = ApiCaller.getInstance();
			expect(instance2).toBe(instance1);
		});

		test('constructor throws if instantiated directly', () => {
			expect(() => new ApiCaller()).toThrow('This class is a singleton and cannot be instantiated directly.');
		});
	});

	describe('request', () => {
		let apiCaller;

		beforeEach(() => {
			apiCaller = ApiCaller.getInstance();
		});
		
		afterEach(() => {
			jest.useRealTimers();
		});

		test('fetches and returns data successfully', async () => {
			const mockData = { data: 'test' };
			fetchMock.mockResolvedValue({
				status: 200,
				ok: true,
				json: jest.fn().mockResolvedValue(mockData),
				headers: { get: jest.fn().mockReturnValue(null) }
			});

			const result = await apiCaller.request('http://test.url');
			expect(fetchMock).toHaveBeenCalledWith('http://test.url', expect.any(Object));
			expect(result).toEqual(mockData);
		});

		test('returns cached data if available and not expired', async () => {
			const cachedData = { cached: true };
			apiCaller.cache.set('http://test.url', {
				data: cachedData,
				expires: Date.now() + 10000
			});

			const result = await apiCaller.request('http://test.url');
			expect(fetchMock).not.toHaveBeenCalled();
			expect(result).toEqual(cachedData);
		});

		test('clears cache and fetches if cache is expired', async () => {
			const mockData = { fresh: true };
			apiCaller.cache.set('http://test.url', {
				data: { cached: true },
				expires: Date.now() - 10000
			});
			fetchMock.mockResolvedValue({
				status: 200,
				ok: true,
				json: jest.fn().mockResolvedValue(mockData),
				headers: { get: jest.fn().mockReturnValue(null) }
			});

			const result = await apiCaller.request('http://test.url');
			expect(fetchMock).toHaveBeenCalled();
			expect(result).toEqual(mockData);
			expect(apiCaller.cache.has('http://test.url')).toBe(false); 
		});

		test('throws error if response is not ok', async () => {
			fetchMock.mockResolvedValue({
				status: 404,
				statusText: 'Not Found',
				ok: false,
				json: jest.fn().mockResolvedValue({ Error: 'Custom Error Message' })
			});

			await expect(apiCaller.request('http://test.url')).rejects.toThrow('Error: 404 Not Found: Custom Error Message');
		});

		test('caches response if cacheTime option is provided', async () => {
			const mockData = { data: 'test' };
			fetchMock.mockResolvedValue({
				status: 200,
				ok: true,
				json: jest.fn().mockResolvedValue(mockData),
				headers: { get: jest.fn().mockReturnValue(null) }
			});

			await apiCaller.request('http://test.url', { cacheTime: 10 });
			expect(apiCaller.cache.has('http://test.url')).toBe(true);
			expect(apiCaller.cache.get('http://test.url').data).toEqual(mockData);
		});

		test('caches response using cache-control header without Age', async () => {
			const mockData = { data: 'test' };
			fetchMock.mockResolvedValue({
				status: 200,
				ok: true,
				json: jest.fn().mockResolvedValue(mockData),
				headers: { get: jest.fn((name) => {
					if (name === 'cache-control') return 'max-age=60';
					return null;
				}) }
			});

			await apiCaller.request('http://test.url');
			expect(apiCaller.cache.has('http://test.url')).toBe(true);
		});

		test('caches response using cache-control header if available', async () => {
			const mockData = { data: 'test' };
			fetchMock.mockResolvedValue({
				status: 200,
				ok: true,
				json: jest.fn().mockResolvedValue(mockData),
				headers: { get: jest.fn((name) => {
					if (name === 'cache-control') return 'max-age=60';
					if (name === 'Age') return '10';
					return null;
				}) }
			});

			await apiCaller.request('http://test.url');
			expect(apiCaller.cache.has('http://test.url')).toBe(true);
		});

		test('handles 429 rate limit without Retry-After correctly', async () => {
			jest.useFakeTimers();
			const mockData = { success: true };
			
			fetchMock
				.mockResolvedValueOnce({
					status: 429,
					ok: false,
					headers: { get: jest.fn().mockReturnValue(null) } // No Retry-After
				})
				.mockResolvedValueOnce({
					status: 200,
					ok: true,
					json: jest.fn().mockResolvedValue(mockData),
					headers: { get: jest.fn().mockReturnValue(null) }
				});

			const promise = apiCaller.request('http://test.url');
			
			await Promise.resolve();
			await Promise.resolve();
			
			jest.advanceTimersByTime(65000);

			const result = await promise;
			expect(fetchMock).toHaveBeenCalledTimes(2);
			expect(result).toEqual(mockData);
		});

		test('handles 429 rate limit correctly', async () => {
			jest.useFakeTimers();
			const mockData = { success: true };
			
			fetchMock
				.mockResolvedValueOnce({
					status: 429,
					ok: false,
					headers: { get: jest.fn().mockReturnValue('2') } // Retry-After 2 seconds
				})
				.mockResolvedValueOnce({
					status: 200,
					ok: true,
					json: jest.fn().mockResolvedValue(mockData),
					headers: { get: jest.fn().mockReturnValue(null) }
				});

			const promise = apiCaller.request('http://test.url');
			
			await Promise.resolve();
			await Promise.resolve();
			
			jest.advanceTimersByTime(3500);

			const result = await promise;
			expect(fetchMock).toHaveBeenCalledTimes(2);
			expect(result).toEqual(mockData);
		});
		
		test('respects internal rate limit (120 req / minute)', async () => {
			jest.useFakeTimers();
			
			const now = Date.now();
			jest.setSystemTime(now);
			apiCaller.rateLimit = 120;

			for (let i = 0; i < 120; i++) {
				apiCaller.requestTimestamps['SHARED'].push(now - 30000); // 30 seconds ago
			}
			
			const mockData = { success: true };
			fetchMock.mockResolvedValue({
				status: 200,
				ok: true,
				json: jest.fn().mockResolvedValue(mockData),
				headers: { get: jest.fn().mockReturnValue(null) }
			});

			const promise = apiCaller.request('http://test.url');
			
			await Promise.resolve();
			
			jest.advanceTimersByTime(35000); 
			
			const result = await promise;
			expect(fetchMock).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockData);
		});
	});

	describe('Cache Memory Management', () => {
		let apiCaller;

		beforeEach(() => {
			apiCaller = ApiCaller.getInstance();
		});

		test('sweepCache should remove expired items', () => {
			apiCaller.cache.set('url1', { data: 1, expires: Date.now() - 1000 }); // Expired
			apiCaller.cache.set('url2', { data: 2, expires: Date.now() + 10000 }); // Valid

			apiCaller.sweepCache();

			expect(apiCaller.cache.has('url1')).toBe(false);
			expect(apiCaller.cache.has('url2')).toBe(true);
			expect(apiCaller.cache.size).toBe(1);
		});

		test('sweepCache should remove oldest items if cache size exceeds 500', () => {
			// Add 600 valid items
			for (let i = 0; i < 600; i++) {
				apiCaller.cache.set(`url${i}`, { data: i, expires: Date.now() + 10000 });
			}

			expect(apiCaller.cache.size).toBe(600);
			apiCaller.sweepCache();

			expect(apiCaller.cache.size).toBe(500);
			// The first 100 items (oldest inserted) should be removed
			expect(apiCaller.cache.has('url0')).toBe(false);
			expect(apiCaller.cache.has('url99')).toBe(false);
			expect(apiCaller.cache.has('url100')).toBe(true);
			expect(apiCaller.cache.has('url599')).toBe(true);
		});

		test('request should trigger sweepCache if cache size > 100', async () => {
			// Mock sweepCache
			const sweepSpy = jest.spyOn(apiCaller, 'sweepCache');
			
			fetchMock.mockResolvedValue({
				status: 200,
				ok: true,
				json: jest.fn().mockResolvedValue({}),
				headers: { get: jest.fn().mockReturnValue(null) }
			});

			// Add 101 valid items
			for (let i = 0; i < 101; i++) {
				apiCaller.cache.set(`url${i}`, { data: i, expires: Date.now() + 10000 });
			}

			await apiCaller.request('http://new.url');

			expect(sweepSpy).toHaveBeenCalledTimes(1);
		});

		test('request should not trigger sweepCache if cache size <= 100', async () => {
			const sweepSpy = jest.spyOn(apiCaller, 'sweepCache');
			
			fetchMock.mockResolvedValue({
				status: 200,
				ok: true,
				json: jest.fn().mockResolvedValue({}),
				headers: { get: jest.fn().mockReturnValue(null) }
			});

			// Add 100 items
			for (let i = 0; i < 100; i++) {
				apiCaller.cache.set(`url${i}`, { data: i, expires: Date.now() + 10000 });
			}

			await apiCaller.request('http://new.url');

			expect(sweepSpy).not.toHaveBeenCalled();
		});
	});
});
