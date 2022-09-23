// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from "@faker-js/faker";
import { Recommendation } from "@prisma/client";
import { CreateRecommendationData } from "../../src/services/recommendationsService";

export function validBody(): CreateRecommendationData {
	return {
		name: faker.lorem.words(),
		youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password()}`,
	};
}

export function invalidBody(): CreateRecommendationData {
	return {
		name: faker.lorem.words(),
		youtubeLink: faker.internet.url(),
	};
}

export function validCompleteBody(): Recommendation {
	return {
		id: faker.datatype.number(),
		name: faker.lorem.words(),
		youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password()}`,
		score: faker.datatype.number(),
	};
}
