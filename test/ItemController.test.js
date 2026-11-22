import ItemController from "../src/modules/ItemController.js";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";


describe("ItemController", () => {
	let itemController;
	let mockApiCaller;

	beforeEach(() => {
		jest.clearAllMocks();
		mockApiCaller = {
			url: "http://test-api.com",
			request: jest.fn()
		};
		itemController = new ItemController(mockApiCaller);
	});

	test("getItemList should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await itemController.getItemList();

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/item/database?page=1"
		);
	});

	test("getItemList should call API with page number", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await itemController.getItemList(2);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/item/database?page=2"
		);
	});

	test("getItemList should handle errors correctly", async () => {
		// GIVEN
		const mockError = new Error("Network error");
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(itemController.getItemList()).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/item/database?page=1"
		);
	});

	test("getItemFullList should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await itemController.getItemFullList();

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/item/database?fullResult"
		);
	});

	test("getItemFullList should handle errors correctly", async () => {
		// GIVEN
		const mockError = new Error("Network error");
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(itemController.getItemFullList()).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/item/database?fullResult"
		);
	});

	test("searchItem should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await itemController.searchItem("test");

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/item/search/test"
		);
	});

	test("searchItem should handle errors correctly", async () => {
		// GIVEN
		const mockError = new Error("Network error");
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(itemController.searchItem("test")).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/item/search/test"
		);
	});

	test("getItemMetadata should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await itemController.getItemMetadata();

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/item/metadata"
		);
	});

	test("getItemMetadata should handle errors correctly", async () => {
		// GIVEN
		const mockError = new Error("Network error");
		mockApiCaller.request.mockRejectedValue(mockError);

		// WHEN
		await expect(itemController.getItemMetadata()).rejects.toThrow(
			mockError
		);

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/item/metadata"
		);
	});
});