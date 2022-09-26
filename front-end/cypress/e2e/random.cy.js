beforeEach(async () => {
	await cy.resetDatabase();
});

describe("Test the Home page", () => {
	it("No recommendation should appear", () => {
		cy.visit("http://localhost:3000");
		cy.contains("No recommendations yet! Create your own :)");

		cy.get("[data-cy=random]").click();

		cy.url().should("equal", "http://localhost:3000/random");
		cy.contains("Loading...");
	});

	it("A random recommendation should appear", () => {
		cy.createRecommendation().then((recommendation) => {
			cy.visit("http://localhost:3000/random");

			cy.get("[data-cy=recommendationName]").contains(
				recommendation.name
			);
			cy.get("[data-cy=scoreContainer]").contains(0);
		});
	});

	it("Should increase recommendation score", () => {
		cy.createRecommendation().then((recommendation) => {
			cy.visit("http://localhost:3000/random");

			cy.getRecommendations().then(({ id }) => {
				cy.upvoteRecommendation(id).then(() => {
					cy.get("[data-cy=recommendationName]").contains(
						recommendation.name
					);
					cy.get("[data-cy=scoreContainer]").contains(1);
				});
			});
		});
	});

	it("Should decrement the recommendation score", () => {
		cy.createRecommendation().then((recommendation) => {
			cy.visit("http://localhost:3000/random");

			cy.getRecommendations().then(({ id }) => {
				cy.downvoteRecommendation(id).then(() => {
					cy.get("[data-cy=recommendationName]").contains(
						recommendation.name
					);
					cy.get("[data-cy=scoreContainer]").contains(-1);
				});
			});
		});
	});

	it("Should navigate to home page", () => {
		cy.visit("http://localhost:3000/random");
		cy.contains("Loading...");

		cy.get("[data-cy=home]").click();

		cy.url().should("equal", "http://localhost:3000/");
		cy.contains("No recommendations yet! Create your own :)");
	});

	it("Should navigate to top page", () => {
		cy.visit("http://localhost:3000/random");
		cy.contains("Loading...");

		cy.get("[data-cy=top]").click();

		cy.url().should("equal", "http://localhost:3000/top");
		cy.contains("No recommendations yet! Create your own :)");
	});
});
