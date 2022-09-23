import { Recommendation } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { recommendationService, CreateRecommendationData } from "../../src/services/recommendationsService";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import * as recommendationBodyFactory from "../factories/recommendationBodyFactory";
import { AppError } from "../../src/utils/errorUtils";

beforeEach(() => {
	jest.resetAllMocks();
	jest.clearAllMocks();
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
