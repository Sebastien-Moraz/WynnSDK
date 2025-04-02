import WynnSDK from '../src/index.js';
import ApiCaller from '../src/modules/ApiCaller.js';
import {beforeEach, describe, expect, jest, test} from '@jest/globals';

jest.mock('../src/modules/ApiCaller.js');

describe('WynnSDK', () => {
	let wynnSDK;
	let mockApiCaller;

	beforeEach(() => {
		jest.clearAllMocks();
		mockApiCaller = {
			url: 'http://test-api.com',
			request: jest.fn()
		};
		ApiCaller.getInstance = jest.fn().mockReturnValue(mockApiCaller);
		

		wynnSDK = new WynnSDK();
	});
	

	test('search should call API correctly', async () => {
		// GIVEN
		const mockResponse = { results: ['test1', 'test2'] };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		const result = await wynnSDK.search('test query');

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/search/test query'
		);
		expect(result).toEqual(mockResponse);
	});

	test('search should handle errors correctly', async () => {
		// GIVEN
		const mockError = new Error('Network error');
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(wynnSDK.search('test query')).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/search/test query'
		);
	});
}); 