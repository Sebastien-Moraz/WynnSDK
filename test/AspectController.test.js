import AspectController from '../src/modules/AspectController';
import {beforeEach, describe, expect, jest, test} from '@jest/globals';


describe('AspectController', () => {
	let aspectController;
	let mockApiCaller;

	beforeEach(() => {
		jest.clearAllMocks();
		mockApiCaller = {
			url: 'http://test-api.com',
			request: jest.fn()
		};
		aspectController = new AspectController(mockApiCaller);
	});

	test('getAspectList should call API correctly', async () => {
		// GIVEN
		const mockResponse = {data: 'test data'};
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await aspectController.getAspectList('warrior');

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/aspects/warrior'
		);
	});
	
	test('getAspectList should handle errors correctly', async () => {
		// GIVEN
		const mockError = new Error('Network error');
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(aspectController.getAspectList('warrior')).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/aspects/warrior'
		);
	});
});