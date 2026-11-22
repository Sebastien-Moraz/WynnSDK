import WynnSDK, { WynnSDK as NamedWynnSDK, WynnApiError } from '../src/index.js';
import ApiCaller from '../src/modules/ApiCaller.js';
import { readFileSync } from 'node:fs';
import { VERSION } from '../src/version.js';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

describe('WynnSDK', () => {
	let wynnSDK;

	beforeEach(() => {
		wynnSDK = new WynnSDK();
		wynnSDK.api.request = jest.fn();
	});

	test('exports', () => {
		expect(NamedWynnSDK).toBe(WynnSDK);
		expect(new WynnApiError('x', { status: 500 })).toBeInstanceOf(Error);
	});

	test('controllers share the instance ApiCaller', () => {
		expect(wynnSDK.api).toBeInstanceOf(ApiCaller);
		expect(wynnSDK.player.api).toBe(wynnSDK.api);
		expect(wynnSDK.news.api).toBe(wynnSDK.api);
	});

	test('each instance has its own token and cache', () => {
		const withToken = new WynnSDK('secret');
		const withoutToken = new WynnSDK();
		expect(withToken.api).not.toBe(withoutToken.api);
		expect(withToken.api.headers['Authorization']).toBe('Bearer secret');
		expect(withoutToken.api.headers['Authorization']).toBeUndefined();
	});

	test('accepts an options object or a token + options', () => {
		const a = new WynnSDK({ token: 'tok', timeout: 1234, debug: true });
		expect(a.api.headers['Authorization']).toBe('Bearer tok');
		expect(a.api.timeout).toBe(1234);
		expect(a.api.debug).toBe(true);

		const b = new WynnSDK('tok2', { maxRetries: 7 });
		expect(b.api.headers['Authorization']).toBe('Bearer tok2');
		expect(b.api.maxRetries).toBe(7);
	});

	test('does not pollute globalThis', () => {
		expect(globalThis.sleep).toBeUndefined();
	});

	test('search encodes the query', async () => {
		const mockResponse = { results: ['test1', 'test2'] };
		wynnSDK.api.request.mockResolvedValue(mockResponse);

		const result = await wynnSDK.search('test query/../x?y#z');

		expect(wynnSDK.api.request).toHaveBeenCalledWith(
			'https://api.wynncraft.com/v3/search/test%20query%2F..%2Fx%3Fy%23z'
		);
		expect(result).toEqual(mockResponse);
	});

	test('search rejects empty queries', async () => {
		await expect(wynnSDK.search('')).rejects.toThrow(TypeError);
		expect(wynnSDK.api.request).not.toHaveBeenCalled();
	});

	test('search propagates errors', async () => {
		const mockError = new Error('Network error');
		wynnSDK.api.request.mockRejectedValue(mockError);
		await expect(wynnSDK.search('test')).rejects.toThrow(mockError);
	});

	test('clearCache clears the instance cache', () => {
		wynnSDK.api.cache.set('x', { data: 1, expires: Date.now() + 1000 });
		wynnSDK.clearCache();
		expect(wynnSDK.api.cache.size).toBe(0);
	});

	test('VERSION matches package.json', () => {
		const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
		expect(VERSION).toBe(pkg.version);
	});
});
