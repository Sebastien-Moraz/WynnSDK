import QuestController from '../src/modules/QuestController.js';
import {beforeEach, describe, expect, jest, test} from '@jest/globals';


describe('QuestController', () => {
	let questController;
	let mockApiCaller;

	beforeEach(() => {
		jest.clearAllMocks();
		mockApiCaller = {
			url: 'http://test-api.com',
			request: jest.fn()
		};
		questController = new QuestController(mockApiCaller);
	});

	test('getQuestCount should call API correctly', async () => {
		// GIVEN
		const mockResponse = { quests: 42 };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		const result = await questController.getQuestCount();

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/map/quests'
		);
		expect(result).toBe(42);
	});

	test('getQuestCount should handle errors correctly', async () => {
		// GIVEN
		const mockError = new Error('Network error');
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(questController.getQuestCount()).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			'http://test-api.com/map/quests'
		);
	});
}); 