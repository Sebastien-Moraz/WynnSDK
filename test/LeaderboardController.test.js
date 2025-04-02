import LeaderboardController from "../src/modules/LeaderboardController";
import ApiCaller from "../src/modules/ApiCaller";
import {beforeEach, describe, expect, jest, test} from '@jest/globals';


jest.mock('../src/modules/ApiCaller.js');

describe("LeaderboardController", () => {
	let leaderboardController;
	let mockApiCaller;

	beforeEach(() => {
		jest.clearAllMocks();
		mockApiCaller = {
			url: "http://test-api.com",
			request: jest.fn()
		};
		ApiCaller.getInstance = jest.fn().mockReturnValue(mockApiCaller);
		leaderboardController = new LeaderboardController();
	});

	test("getLeaderboard should call API correctly", async () => {
		// GIVEN
		const mockResponse = {data: "test data"};
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await leaderboardController.getLeaderboard("category");

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/leaderboards/category?resultLimit=100"
		);
	});

	test("getLeaderboard should call API with category and resultLimit", async () => {
		// GIVEN
		const mockResponse = {data: "test data"};
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await leaderboardController.getLeaderboard("category", 1000);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/leaderboards/category?resultLimit=1000"
		);
	});

	test("getLeaderboard should handle errors correctly", async () => {
		// GIVEN
		const mockError = new Error("Network error");
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(leaderboardController.getLeaderboard("category")).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/leaderboards/category?resultLimit=100"
		);
	});

	test("getLeaderboardCategories should call API correctly", async () => {
		// GIVEN
		const mockResponse = {data: "test data"};
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await leaderboardController.getLeaderboardCategories();

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/leaderboards/types"
		);
	});

	test("getLeaderboardCategories should handle errors correctly", async () => {
		// GIVEN
		const mockError = new Error("Network error");
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(leaderboardController.getLeaderboardCategories()).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/leaderboards/types"
		);
	});
});