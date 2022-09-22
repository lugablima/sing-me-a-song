import supertest from "supertest";
import { Recommendation } from "@prisma/client";
import app from "../../src/app";
import { prisma } from "../../src/database";
import { deleteAllData, disconnectPrisma, createScenarioTwelveRecommendations } from "../factories/scenarioFactory";

beforeEach(async () => {
	await deleteAllData();
});

afterAll(async () => {
	await disconnectPrisma();
});

const server = supertest(app);

describe("POST /e2e/reset", () => {
	it("Should answer with status 200 and reset the database", async () => {
		await createScenarioTwelveRecommendations();

		const result = await server.post("/e2e/reset");

		const recommendations: Recommendation[] = await prisma.recommendation.findMany();

		expect(result.status).toBe(200);
		expect(recommendations.length).toEqual(0);
	});
});
