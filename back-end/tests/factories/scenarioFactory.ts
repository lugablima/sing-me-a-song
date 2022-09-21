// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from "@faker-js/faker";
import { prisma } from "../../src/database";
import { validBody } from "./recommendationBodyFactory";

export async function deleteAllData() {
	await prisma.$transaction([prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`]);
}

export async function disconnectPrisma() {
	await prisma.$disconnect();
}

export async function createScenarioTwelveRecommendations() {
	await prisma.recommendation.createMany({
		data: [
			validBody(),
			validBody(),
			validBody(),
			validBody(),
			validBody(),
			validBody(),
			validBody(),
			validBody(),
			validBody(),
			validBody(),
			validBody(),
			validBody(),
		],
	});
}

export async function createScenarioTwelveRecommendationsWithRandomScores() {
	await prisma.recommendation.createMany({
		data: [
			{ ...validBody(), score: faker.datatype.number({ min: -5, max: 100 }) },
			{ ...validBody(), score: faker.datatype.number({ min: -5, max: 100 }) },
			{ ...validBody(), score: faker.datatype.number({ min: -5, max: 100 }) },
			{ ...validBody(), score: faker.datatype.number({ min: -5, max: 100 }) },
			{ ...validBody(), score: faker.datatype.number({ min: -5, max: 100 }) },
			{ ...validBody(), score: faker.datatype.number({ min: -5, max: 100 }) },
			{ ...validBody(), score: faker.datatype.number({ min: -5, max: 100 }) },
			{ ...validBody(), score: faker.datatype.number({ min: -5, max: 100 }) },
			{ ...validBody(), score: faker.datatype.number({ min: -5, max: 100 }) },
			{ ...validBody(), score: faker.datatype.number({ min: -5, max: 100 }) },
			{ ...validBody(), score: faker.datatype.number({ min: -5, max: 100 }) },
			{ ...validBody(), score: faker.datatype.number({ min: -5, max: 100 }) },
		],
	});
}
