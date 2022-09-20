import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { Recommendation } from "@prisma/client";
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

		const recommendationCreated: Recommendation = await prisma.recommendation.findUnique({
			where: { name: recommendation.name },
		});

		expect(result.status).toBe(201);
		expect(recommendationCreated).not.toBeNull();
	});

	it("Should answer with status 422 when sending a invalid payload", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.invalidBody();

		const result = await server.post("/").send(recommendation);

		const recommendationNotExists: Recommendation | null = await prisma.recommendation.findUnique({
			where: { name: recommendation.name },
		});

		expect(result.status).toBe(422);
		expect(recommendationNotExists).toBeNull();
	});

	it("Should answer with status 409 when recommendation name already exists", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.validBody();

		await recommendationFactory(recommendation);

		const result = await server.post("/").send(recommendation);

		const recommendationIsUnique: Recommendation[] = await prisma.recommendation.findMany({
			where: { name: recommendation.name },
		});

		expect(result.status).toBe(409);
		expect(recommendationIsUnique.length).toEqual(1);
	});
});

describe("POST /:id/upvote", () => {
	it("Should answer with status 200 when recommendation id exists and update score key", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.validBody();

		const { id, name, score: oldScore }: Recommendation = await recommendationFactory(recommendation);

		const result = await server.post(`/${id}/upvote`);

		const { score: newScore }: Recommendation = await prisma.recommendation.findUnique({ where: { name } });

		expect(result.status).toBe(200);
		expect(oldScore + 1).toEqual(newScore);
	});

	it("Should answer with status 404 when recommendation id does not exist", async () => {
		const id: number = faker.datatype.number();
		const result = await server.post(`/${id}/upvote`);

		expect(result.status).toBe(404);
	});
});
