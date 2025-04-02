import ClassController from "../src/modules/ClassController.js";
import ApiCaller from "../src/modules/ApiCaller.js";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";

jest.mock("../src/modules/ApiCaller.js");

describe("ClassController", () => {
	let classController;
	let mockApiCaller;
	
	beforeEach(() => {
		jest.clearAllMocks();
		mockApiCaller = {
			url: "http://test-api.com",
			request: jest.fn()
		};
		ApiCaller.getInstance = jest.fn().mockReturnValue(mockApiCaller);
		classController = new ClassController();
	});
	
	test("getClassList should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await classController.getClassList();

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/classes"
		);
	});
	
	test("getClass should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);

		// WHEN
		await classController.getClass("warrior");

		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/classes/warrior"
		);
	});
	
	test("getClassList should handle errors correctly", async () => {
		// GIVEN
		const mockError = new Error("Network error");
		mockApiCaller.request.mockRejectedValue(mockError);
		
		// WHEN
		await expect(classController.getClassList()).rejects.toThrow(
			mockError
		);
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/classes"
		);
	});
	
	test("getClass should handle errors correctly", async () => {
		// GIVEN
		const mockError = new Error("Network error");
		mockApiCaller.request.mockRejectedValue(mockError);
		
		// WHEN
		await expect(classController.getClass("warrior")).rejects.toThrow(
			mockError
		);
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/classes/warrior"
		);
	});
})