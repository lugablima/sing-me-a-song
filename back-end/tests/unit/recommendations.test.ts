import { Recommendation } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { recommendationService, CreateRecommendationData } from "../../src/services/recommendationsService";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import * as recommendationBodyFactory from "../factories/recommendationBodyFactory";
import { AppError } from "../../src/utils/errorUtils";

beforeEach(() => {
	jest.resetAllMocks();
	jest.clearAllMocks();
	jest.spyOn(global.Math, "random").mockRestore();
});

describe("Insert function", () => {
	it("Should call the repository to create a recommendation, if the name of the recommendation does not exist", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.validBody();

		jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce(null);

		jest.spyOn(recommendationRepository, "create").mockResolvedValueOnce();

		await recommendationService.insert(recommendation);

		expect(recommendationRepository.findByName).toBeCalled();
		expect(recommendationRepository.create).toBeCalled();
	});

	it("It should trigger an error if the name of the recommendation to be created already exists", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.validBody();
		const expectedError: AppError = { type: "conflict", message: "Recommendations names must be unique" };

		jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce({
			id: 1,
			...recommendation,
			score: 0,
		});

		const promise = recommendationService.insert(recommendation);

		expect(recommendationRepository.findByName).toBeCalled();
		expect(promise).rejects.toEqual(expectedError);
		expect(recommendationRepository.create).not.toBeCalled();
	});
});

describe("Upvote function", () => {
	it("Should increase the recommendation score", async () => {
		const recommendation: Recommendation = recommendationBodyFactory.validCompleteBody();

		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation);

		jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(recommendation);

		await recommendationService.upvote(recommendation.id);

		expect(recommendationRepository.find).toBeCalled();
		expect(recommendationRepository.updateScore).toBeCalled();
	});

	it("Should trigger an error and not update the recommendation", async () => {
		const id: number = faker.datatype.number();
		const expectedError: AppError = { type: "not_found", message: "" };

		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

		const promise = recommendationService.upvote(id);

		expect(promise).rejects.toEqual(expectedError);
		expect(recommendationRepository.find).toBeCalled();
		expect(recommendationRepository.updateScore).not.toBeCalled();
	});
});

describe("Downvote function", () => {
	it("Should decrease the recommendation score", async () => {
		const recommendation: Recommendation = recommendationBodyFactory.validCompleteBody();
		const score: number = 5;

		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation);

		jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce({ ...recommendation, score });

		await recommendationService.downvote(recommendation.id);

		expect(recommendationRepository.find).toBeCalled();
		expect(recommendationRepository.updateScore).toBeCalled();
	});

	it("Should trigger an error and not update the recommendation", async () => {
		const id: number = faker.datatype.number();
		const expectedError: AppError = { type: "not_found", message: "" };

		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

		const promise = recommendationService.downvote(id);

		expect(promise).rejects.toEqual(expectedError);
		expect(recommendationRepository.find).toBeCalled();
		expect(recommendationRepository.updateScore).not.toBeCalled();
	});

	it("Should exclude the recommendation, as the score was below -5", async () => {
		const recommendation: Recommendation = recommendationBodyFactory.validCompleteBody();
		const score: number = -10;

		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation);

		jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce({ ...recommendation, score });

		jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce();

		await recommendationService.downvote(recommendation.id);

		expect(recommendationRepository.find).toBeCalled();
		expect(recommendationRepository.updateScore).toBeCalled();
		expect(recommendationRepository.remove).toBeCalled();
	});
});

describe("Get function", () => {
	it("Should return an array of recommendations", async () => {
		const recommendation: Recommendation = recommendationBodyFactory.validCompleteBody();

		jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([recommendation]);

		const result = await recommendationService.get();

		expect(recommendationRepository.findAll).toBeCalled();
		expect(result).toBeInstanceOf(Array);
	});
});

describe("Get by id function", () => {
	it("Should return an recommendation", async () => {
		const id: number = faker.datatype.number();
		const recommendation: Recommendation = recommendationBodyFactory.validCompleteBody();

		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation);

		const result = await recommendationService.getById(id);

		expect(recommendationRepository.find).toBeCalled();
		expect(result).toEqual(recommendation);
	});

	it("Should trigger an error when recommendation id is not found", () => {
		const id: number = faker.datatype.number();
		const expectedError: AppError = { type: "not_found", message: "" };

		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

		const promise = recommendationService.getById(id);

		expect(recommendationRepository.find).toBeCalled();
		expect(promise).rejects.toEqual(expectedError);
	});
});

describe("Get top function", () => {
	it("Should return an array of recommendations", async () => {
		const amount: number = 1;
		const recommendation: Recommendation = recommendationBodyFactory.validCompleteBody();

		jest.spyOn(recommendationRepository, "getAmountByScore").mockResolvedValueOnce([recommendation]);

		const result = await recommendationService.getTop(amount);

		expect(recommendationRepository.getAmountByScore).toBeCalled();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toEqual(amount);
	});
});

describe("Get random function", () => {
	it("Should return a random recommendation with a score greater than 10", async () => {
		const random: number = faker.datatype.number({ min: 0, max: 0.6, precision: 0.1 });
		const recommendation: Recommendation = recommendationBodyFactory.validCompleteBody();

		jest.spyOn(Math, "random").mockReturnValueOnce(random);
		jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([recommendation]);

		const result = await recommendationService.getRandom();

		expect(Math.random).toBeCalledTimes(2);
		expect(recommendationRepository.findAll).toBeCalledTimes(1);
		expect(result).toEqual(recommendation);
	});

	it("Should return a random recommendation with a score between -5 and 10", async () => {
		const random: number = faker.datatype.number({ min: 0.7, max: 0.9, precision: 0.1 });
		const recommendation: Recommendation = recommendationBodyFactory.validCompleteBody();

		jest.spyOn(Math, "random").mockReturnValueOnce(random);
		jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([recommendation]);

		const result = await recommendationService.getRandom();

		expect(Math.random).toBeCalledTimes(2);
		expect(recommendationRepository.findAll).toBeCalledTimes(1);
		expect(result).toEqual(recommendation);
	});

	it("Should return a random recommendation", async () => {
		const random: number = faker.datatype.number({ min: 0, max: 1, precision: 0.1 });
		const recommendation: Recommendation = recommendationBodyFactory.validCompleteBody();

		jest.spyOn(Math, "random").mockReturnValueOnce(random);
		jest.spyOn(recommendationRepository, "findAll")
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([recommendation]);

		const result = await recommendationService.getRandom();

		expect(Math.random).toBeCalledTimes(2);
		expect(recommendationRepository.findAll).toBeCalledTimes(2);
		expect(result).toEqual(recommendation);
	});

	it("Should trigger an error when there is no song registered", async () => {
		const random: number = faker.datatype.number({ min: 0, max: 1, precision: 0.1 });
		const expectedError: AppError = { type: "not_found", message: "" };

		jest.spyOn(Math, "random").mockReturnValueOnce(random);
		jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([]).mockResolvedValueOnce([]);

		expect.assertions(3);
		await expect(recommendationService.getRandom()).rejects.toEqual(expectedError);
		expect(Math.random).toBeCalledTimes(1);
		expect(recommendationRepository.findAll).toBeCalledTimes(2);
	});
});
