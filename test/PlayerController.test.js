import PlayerController from '../src/modules/PlayerController.js';
import ApiCaller from '../src/modules/ApiCaller.js';
import {beforeEach, describe, expect, jest, test} from '@jest/globals';

jest.mock('../src/modules/ApiCaller.js');

describe('PlayerController', () => {
	let playerController;
	let mockApiCaller;

	beforeEach(() => {
		jest.clearAllMocks();
		mockApiCaller = {
			url: 'http://test-api.com',
			request: jest.fn()
		};
		ApiCaller.getInstance = jest.fn().mockReturnValue(mockApiCaller);
		playerController = new PlayerController();
	});

	test('getPlayer should call API correctly', async () => {
		// GIVEN
		const mockResponse = { data: 'test data' };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await playerController.getPlayer('testPlayer');

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/player/testPlayer'
		);
	});

	test('getPlayerFullStats should call API correctly', async () => {
		// GIVEN
		const mockResponse = { data: 'test data' };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await playerController.getPlayerFullStats('testPlayer');

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/player/testPlayer?fullStats=true'
		);
	});

	test('getPlayerCharacters should call API correctly', async () => {
		// GIVEN
		const mockResponse = { data: 'test data' };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await playerController.getPlayerCharacters('testPlayer');

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/player/testPlayer/characters'
		);
	});

	test('getPlayerCharacter should call API correctly', async () => {
		// GIVEN
		const mockResponse = { data: 'test data' };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await playerController.getPlayerCharacter('testPlayer', 'testUUID');

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/player/testPlayer/characters/testUUID'
		);
	});

	test('getPlayerCharacterAbilities should call API correctly', async () => {
		// GIVEN
		const mockResponse = { data: 'test data' };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await playerController.getPlayerCharacterAbilities('testPlayer', 'testUUID');

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/player/testPlayer/characters/testUUID/abilities'
		);
	});

	test('getWhoami should call API correctly', async () => {
		// GIVEN
		const mockResponse = { data: 'test data' };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await playerController.getWhoami();

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/player/whoami',
			{ cacheTime: 5 }
		);
	});

	test('getPlayersOnline should call API correctly', async () => {
		// GIVEN
		const mockResponse = { data: 'test data' };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await playerController.getPlayersOnline('username', 'EU1');

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/player?identifier=username&server=EU1'
		);
	});

	test('getPlayerLocations should call API correctly', async () => {
		// GIVEN
		const mockResponse = { data: 'test data' };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await playerController.getPlayerLocations();

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/map/locations/player',
			{ cacheTime: 15 }
		);
	});

	test('getPlayer should handle errors correctly', async () => {
		// GIVEN
		const mockError = new Error('Network error');
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(playerController.getPlayer('testPlayer')).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/player/testPlayer'
		);
	});
}); 