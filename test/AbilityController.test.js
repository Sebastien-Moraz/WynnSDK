import AbilityController from '../src/modules/AbilityController.js';
import ApiCaller from '../src/modules/ApiCaller.js';
import {beforeEach, describe, expect, jest, test} from '@jest/globals';

jest.mock('../src/modules/ApiCaller.js');

describe('AbilityController', () => {
	let abilityController;
	let mockApiCaller;

	beforeEach(() => {
		jest.clearAllMocks();
		mockApiCaller = {
			url: 'http://test-api.com',
			request: jest.fn()
		};
		ApiCaller.getInstance = jest.fn().mockReturnValue(mockApiCaller);
		abilityController = new AbilityController();
	});

	test('getAbilityTree should call API correctly', async () => {
		// GIVEN
		const mockResponse = { data: 'test data' };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await abilityController.getAbilityTree('warrior');

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/ability/tree/warrior'
		);
	});

	test('getAbilityMap should call API correctly', async () => {
		// GIVEN
		const mockResponse = { data: 'test data' };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await abilityController.getAbilityMap('warrior');

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/ability/map/warrior'
		);
	});
	
	test('getAbilityTree should handle errors correctly', async () => {
		// GIVEN
		const mockError = new Error('Network error');
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(abilityController.getAbilityTree('warrior')).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/ability/tree/warrior'
		);
	});
	
	test('getAbilityMap should handle errors correctly', async () => {
		// GIVEN
		const mockError = new Error('Network error');
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(abilityController.getAbilityMap('warrior')).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/ability/map/warrior'
		);
	});
});