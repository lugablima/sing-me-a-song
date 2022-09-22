import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { Recommendation } from "@prisma/client";
import app from "../../src/app";
import { prisma } from "../../src/database";
import {
	deleteAllData,
	disconnectPrisma,
	createScenarioTwelveRecommendations,
	createScenarioTwelveRecommendationsWithRandomScores,
} from "../factories/scenarioFactory";
import * as recommendationBodyFactory from "../factories/recommendationBodyFactory";
import { CreateRecommendationData } from "../../src/services/recommendationsService";
import recommendationFactory from "../factories/recommendationFactory";

beforeEach(async () => {
	await deleteAllData();
});

afterAll(async () => {
	await disconnectPrisma();
});

const server = supertest(app);

describe("POST /recommendations", () => {
	it("Should answer with status 201 when sending a valid payload", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.validBody();

		const result = await server.post("/recommendations").send(recommendation);

		const recommendationCreated: Recommendation | null = await prisma.recommendation.findUnique({
			where: { name: recommendation.name },
		});

		expect(result.status).toBe(201);
		expect(recommendationCreated).not.toBeNull();
	});

	it("Should answer with status 422 when sending a invalid payload", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.invalidBody();

		const result = await server.post("/recommendations").send(recommendation);

		const recommendationNotExists: Recommendation | null = await prisma.recommendation.findUnique({
			where: { name: recommendation.name },
		});

		expect(result.status).toBe(422);
		expect(recommendationNotExists).toBeNull();
	});

	it("Should answer with status 409 when recommendation name already exists", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.validBody();

		await recommendationFactory(recommendation);

		const result = await server.post("/recommendations").send(recommendation);

		const recommendationIsUnique: Recommendation[] = await prisma.recommendation.findMany({
			where: { name: recommendation.name },
		});

		expect(result.status).toBe(409);
		expect(recommendationIsUnique.length).toEqual(1);
	});
});

describe("POST /recommendations/:id/upvote", () => {
	it("Should answer with status 200 when recommendation id exists and increment score key", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.validBody();

		const { id, name, score: oldScore }: Recommendation = await recommendationFactory(recommendation);

		const result = await server.post(`/recommendations/${id}/upvote`);

		const { score: newScore } = (await prisma.recommendation.findUnique({ where: { name } })) as Recommendation;

		expect(result.status).toBe(200);
		expect(oldScore + 1).toEqual(newScore);
	});

	it("Should answer with status 404 when recommendation id does not exist", async () => {
		const id: number = faker.datatype.number();
		const result = await server.post(`/recommendations/${id}/upvote`);

		const recommendation: Recommendation | null = await prisma.recommendation.findUnique({ where: { id } });

		expect(result.status).toBe(404);
		expect(recommendation).toBeNull();
	});
});

describe("POST /recommendations/:id/downvote", () => {
	it("Should answer with status 200 when recommendation id exists and decrement score key", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.validBody();

		const { id, name, score: oldScore }: Recommendation = await recommendationFactory(recommendation);

		const result = await server.post(`/recommendations/${id}/downvote`);

		const { score: newScore } = (await prisma.recommendation.findUnique({ where: { name } })) as Recommendation;

		expect(result.status).toBe(200);
		expect(oldScore - 1).toEqual(newScore);
	});

	it("Should answer with status 404 when recommendation id does not exist", async () => {
		const id: number = faker.datatype.number();
		const result = await server.post(`/recommendations/${id}/downvote`);

		const recommendation: Recommendation | null = await prisma.recommendation.findUnique({ where: { id } });

		expect(result.status).toBe(404);
		expect(recommendation).toBeNull();
	});

	it("Should delete the recommendation from the database when your score is less than -5", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.validBody();

		const { id, score: oldScore }: Recommendation = await recommendationFactory({ ...recommendation, score: -5 });

		const result = await server.post(`/recommendations/${id}/downvote`);

		const recommendationDeleted: Recommendation | null = await prisma.recommendation.findUnique({ where: { id } });

		expect(result.status).toBe(200);
		expect(oldScore).toEqual(-5);
		expect(recommendationDeleted).toBeNull();
	});
});

describe("GET /recommendations", () => {
	it("Should answer with the last 10 recommendations in a specific format", async () => {
		await createScenarioTwelveRecommendations();

		const result = await server.get("/recommendations");

		const recommendations: Recommendation[] = await prisma.recommendation.findMany({
			orderBy: { id: "desc" },
			take: 10,
		});

		expect(result.body.length).toEqual(10);
		expect(result.body).toEqual(recommendations);
	});
});

describe("GET /recommendations/:id", () => {
	it("Should answer with the correct recommendation", async () => {
		const recommendation: CreateRecommendationData = recommendationBodyFactory.validBody();

		const recommendationCreated: Recommendation = await recommendationFactory(recommendation);

		const result = await server.get(`/recommendations/${recommendationCreated.id}`);

		expect(result.body).toBeInstanceOf(Object);
		expect(result.body).toEqual(recommendationCreated);
	});

	it("Should answer with status 404 when recommendation id does not exist", async () => {
		const id: number = faker.datatype.number();
		const result = await server.get(`/recommendations/${id}`);

		const recommendation: Recommendation | null = await prisma.recommendation.findUnique({ where: { id } });

		expect(result.status).toBe(404);
		expect(recommendation).toBeNull();
	});
});

describe("GET /recommendations/random", () => {
	it("Should answer with a random recommendation", async () => {
		await createScenarioTwelveRecommendationsWithRandomScores();

		const result = await server.get("/recommendations/random");

		expect(result.body).toEqual(
			expect.objectContaining<Recommendation>({
				id: expect.any(Number),
				name: expect.any(String),
				youtubeLink: expect.any(String),
				score: expect.any(Number),
			})
		);
	});

	it("Should answer with status 404 when there is no recommendation registered", async () => {
		const result = await server.get("/recommendations/random");

		const recommendation: Recommendation[] = await prisma.recommendation.findMany();

		expect(result.status).toBe(404);
		expect(recommendation.length).toEqual(0);
	});
});

describe("GET /recommendations/top/:amount", () => {
	it("Should answer with the correct recommendation ranking, according to the amount parameter passed", async () => {
		await createScenarioTwelveRecommendationsWithRandomScores();

		const amount: number = faker.datatype.number({ min: 1, max: 12 });

		const result = await server.get(`/recommendations/top/${amount}`);

		const recommendationsExpected: Recommendation[] = await prisma.recommendation.findMany({
			orderBy: { score: "desc" },
			take: amount,
		});

		expect(result.body).toBeInstanceOf(Array);
		expect(result.body.length).toEqual(amount);
		expect(result.body).toEqual(recommendationsExpected);
	});
});
