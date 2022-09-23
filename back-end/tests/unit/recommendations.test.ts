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
