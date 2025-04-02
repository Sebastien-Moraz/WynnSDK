import MapController from "../src/modules/MapController.js";
import ApiCaller from '../src/modules/ApiCaller.js';
import {beforeEach, describe, expect, jest, test} from '@jest/globals';

jest.mock('../src/modules/ApiCaller.js');

describe('MapController', () => {
	let mapController;
	let mockApiCaller;

	beforeEach(() => {
		jest.clearAllMocks();
		mockApiCaller = {
			url: 'http://test-api.com',
			request: jest.fn()
		};
		ApiCaller.getInstance = jest.fn().mockReturnValue(mockApiCaller);
		mapController = new MapController();
	});

	test('getMapMarkers should call API correctly', async () => {
		// GIVEN
		const mockResponse = {data: 'test data'};
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await mapController.getMapMarkers();

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/map/locations/markers'
		);
	});

	test('getMapMarkers should handle errors correctly', async () => {
		// GIVEN
		const mockError = new Error('Network error');
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(mapController.getMapMarkers()).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/map/locations/markers'
		);
	});
});