import supertest from "supertest";
import app from "../src/app";
import { prisma } from "../src/database";
import { deleteAllData, disconnectPrisma } from "./factories/scenarioFactory";
import * as recommendationBodyFactory from "./factories/recommendationBodyFactory";
import { CreateRecommendationData } from "../src/services/recommendationsService";
import recommendationFactory from "./factories/recommendationFactory";

beforeEach(async () => {
	await deleteAllData();
});

afterAll(async () => {
	await disconnectPrisma();
});

const server = supertest(app);

describe("POST /", () => {
	it("Should answer with status 201 when sending a valid payload", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.validBody();

		const result = await server.post("/").send(recommendation);

		const recommendationCreated = await prisma.recommendation.findUnique({ where: { name: recommendation.name } });

		expect(result.status).toBe(201);
		expect(recommendationCreated).not.toBeNull();
	});

	it("Should answer with status 422 when sending a invalid payload", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.invalidBody();

		const result = await server.post("/").send(recommendation);

		const recommendationNotExists = await prisma.recommendation.findUnique({
			where: { name: recommendation.name },
		});

		expect(result.status).toBe(422);
		expect(recommendationNotExists).toBeNull();
	});

	it("Should answer with status 409 when recommendation name already exists", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.validBody();

		await recommendationFactory(recommendation);

		const result = await server.post("/").send(recommendation);

		const recommendationIsUnique = await prisma.recommendation.findMany({
			where: { name: recommendation.name },
		});

		expect(result.status).toBe(409);
		expect(recommendationIsUnique.length).toEqual(1);
	});
});
