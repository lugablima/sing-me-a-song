import { prisma } from "../../src/database";
import { CreateRecommendationData } from "../../src/services/recommendationsService";

export default function recommendationFactory(recommendation: CreateRecommendationData) {
	return prisma.recommendation.create({
		data: recommendation,
	});
}
