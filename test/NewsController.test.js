import NewsController from '../src/modules/NewsController.js';
import ApiCaller from '../src/modules/ApiCaller.js';
import {beforeEach, describe, expect, jest, test} from '@jest/globals';

jest.mock('../src/modules/ApiCaller.js');

describe('NewsController', () => {
	let newsController;
	let mockApiCaller;

	beforeEach(() => {
		jest.clearAllMocks();
		mockApiCaller = {
			url: 'http://test-api.com',
			request: jest.fn()
		};
		ApiCaller.getInstance = jest.fn().mockReturnValue(mockApiCaller);
		newsController = new NewsController();
	});

	test('getNews should call API correctly', async () => {
		// GIVEN
		const mockResponse = [{ title: 'Test News', content: 'Test Content' }];
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		const result = await newsController.getNews();

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/latest-news'
		);
		expect(result).toEqual(mockResponse);
	});

	test('getNews should handle errors correctly', async () => {
		// GIVEN
		const mockError = new Error('Network error');
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(newsController.getNews()).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/latest-news'
		);
	});
}); 