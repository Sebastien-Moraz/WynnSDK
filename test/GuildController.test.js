import GuildController from "../src/modules/GuildController.js";
import ApiCaller from "../src/modules/ApiCaller.js";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";

jest.mock("../src/modules/ApiCaller.js");

describe("GuildController", () => {
	let guildController;
	let mockApiCaller;
	
	beforeEach(() => {
		jest.clearAllMocks();
		mockApiCaller = {
			url: "http://test-api.com",
			request: jest.fn()
		};
		ApiCaller.getInstance = jest.fn().mockReturnValue(mockApiCaller);
		guildController = new GuildController();
	});
	
	test("getGuild should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);
		
		// WHEN
		await guildController.getGuild("testGuild");
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/guild/testGuild?identifier=username"
		);
	});
	
	test("getGuild with identifier should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);
		
		// WHEN
		await guildController.getGuild("testGuild", "uuid");
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/guild/testGuild?identifier=uuid"
		);
	});
	
	test("getGuild shoulld handle errors correctly", async () => {
		// GIVEN
		const mockError = new Error("Network error");
		mockApiCaller.request.mockRejectedValue(mockError);
		
		// WHEN
		await expect(guildController.getGuild("testGuild")).rejects.toThrow(
			mockError
		);
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/guild/testGuild?identifier=username"
		);
	});
	
	test("getGuildByPrefix should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);
		
		// WHEN
		await guildController.getGuildByPrefix("testPrefix");
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/guild/prefix/testPrefix?identifier=username"
		);
	});
	
	test("getGuildByPrefix with identifier should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);
		
		// WHEN
		await guildController.getGuildByPrefix("testPrefix", "uuid");
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/guild/prefix/testPrefix?identifier=uuid"
		);
	});
	
	test("getGuildByPrefix should handle errors correctly", async () => {
		// GIVEN
		const mockError = new Error("Network error");
		mockApiCaller.request.mockRejectedValue(mockError);
		
		// WHEN
		await expect(guildController.getGuildByPrefix("testPrefix")).rejects.toThrow(
			mockError
		);
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/guild/prefix/testPrefix?identifier=username"
		);
	});
	
	test("getGuildList should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);
		
		// WHEN
		await guildController.getGuildList();
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/guild/list/guild?identifier=name"
		);
	});
	
	test("getGuildList with identifier should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);
		
		// WHEN
		await guildController.getGuildList("name");
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/guild/list/guild?identifier=name"
		);
	});
	
	test("getGuildList should handle errors correctly", async () => {
		// GIVEN
		const mockError = new Error("Network error");
		mockApiCaller.request.mockRejectedValue(mockError);
		
		// WHEN
		await expect(guildController.getGuildList()).rejects.toThrow(mockError);
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/guild/list/guild?identifier=name"
		);
	});
	
	test("getGuildTerritoryList should call API correctly", async () => {
		// GIVEN
		const mockResponse = { data: "test data" };
		mockApiCaller.request.mockResolvedValue(mockResponse);
		
		// WHEN
		await guildController.getGuildTerritoryList();
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/guild/list/territory"
		);
	});
	
	test("getGuildTerritoryList should handle errors correctly", async () => {
		// GIVEN
		const mockError = new Error("Network error");
		mockApiCaller.request.mockRejectedValue(mockError);
		
		// WHEN
		await expect(guildController.getGuildTerritoryList()).rejects.toThrow(
			mockError
		);
		
		// THEN
		expect(mockApiCaller.request).toHaveBeenCalledWith(
			"http://test-api.com/guild/list/territory"
		);
	});
})