import { prisma } from "../../src/database";
import { CreateRecommendationData, CreateRecommendationWithScore } from "../../src/services/recommendationsService";

export default function recommendationFactory(
	recommendation: CreateRecommendationData | CreateRecommendationWithScore
) {
	return prisma.recommendation.create({
		data: recommendation,
	});
}
