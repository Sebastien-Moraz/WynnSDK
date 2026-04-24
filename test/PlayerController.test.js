import PlayerController from '../src/modules/PlayerController.js';
import ApiCaller from '../src/modules/ApiCaller.js';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

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
			'http://test-api.com/player/testPlayer?fullResult'
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

	test('getPlayersOnline should use default identifier if none provided', async () => {
		// GIVEN
		const mockResponse = { data: 'test data' };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await playerController.getPlayersOnline();

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/player?identifier=username'
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

	describe('getHuntersInSameServer', () => {
		test('should return list of hunters in the same server', async () => {
			// GIVEN
			jest.spyOn(playerController, 'getPlayerLocations').mockResolvedValue([
				{ name: 'testPlayer', uuid: 'uuid-1', server: 'WC1' },
				{ name: 'otherPlayer', uuid: 'uuid-2', server: 'WC2' }
			]);
			jest.spyOn(playerController, 'getPlayersOnline').mockResolvedValue({
				players: {
					'uuid-1': true,
					'uuid-3': true,
					'uuid-4': true
				}
			});
			jest.spyOn(playerController, 'getPlayerFullStats').mockImplementation(async (uuid) => {
				if (uuid === 'uuid-1') return { activeCharacter: 'char-1' };
				if (uuid === 'uuid-3') return { activeCharacter: 'char-3' };
				if (uuid === 'uuid-4') return { activeCharacter: null };
			});
			jest.spyOn(playerController, 'getPlayerCharacter').mockImplementation(async (uuid, char) => {
				if (uuid === 'uuid-1') return { gamemode: ['regular'] };
				if (uuid === 'uuid-3') return { gamemode: ['ironman', 'hunted'] };
			});

			// WHEN
			const hunters = await playerController.getHuntersInSameServer('testPlayer');

			// THEN
			expect(playerController.getPlayerLocations).toHaveBeenCalled();
			expect(playerController.getPlayersOnline).toHaveBeenCalledWith('uuid', 'WC1');
			expect(hunters).toHaveLength(1);
			expect(hunters[0]).toEqual({
				activeCharacter: 'char-3',
				character: { gamemode: ['ironman', 'hunted'] }
			});
		});

		test('should throw error if player is not found', async () => {
			// GIVEN
			jest.spyOn(playerController, 'getPlayerLocations').mockResolvedValue([
				{ name: 'otherPlayer', server: 'WC2' }
			]);

			// WHEN
			await expect(playerController.getHuntersInSameServer('testPlayer')).rejects.toThrow('Player not found');
		});

		test('should work with UUID instead of name', async () => {
			// GIVEN
			jest.spyOn(playerController, 'getPlayerLocations').mockResolvedValue([
				{ name: 'testPlayer', uuid: 'uuid-1', server: 'WC1' }
			]);
			jest.spyOn(playerController, 'getPlayersOnline').mockResolvedValue({ players: {} });

			// WHEN
			await playerController.getHuntersInSameServer('uuid-1');

			// THEN
			expect(playerController.getPlayersOnline).toHaveBeenCalledWith('uuid', 'WC1');
		});
	});
}); 