import { faker } from "@faker-js/faker";

beforeEach(async () => {
	await cy.resetDatabase();
});

describe("Test the Home page", () => {
	it("Should create a recommendation", () => {
		const recommendation = {
			name: faker.lorem.words(),
			youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password()}`,
		};

		cy.visit("http://localhost:3000");
		cy.contains("No recommendations yet! Create your own :)");

		cy.get("[data-cy=name]").type(recommendation.name);
		cy.get("[data-cy=link]").type(recommendation.youtubeLink);

		cy.intercept("POST", "http://localhost:5000/recommendations").as(
			"createRecommendation"
		);

		cy.get("[data-cy=create]").click();

		cy.wait("@createRecommendation");

		cy.get("[data-cy=recommendationName]").contains(recommendation.name);
		cy.get("[data-cy=scoreContainer]").contains(0);
	});

	it("Should return a message error when the recommendation name is not sent", () => {
		const recommendation = {
			name: faker.lorem.words(),
			youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password()}`,
		};

		cy.visit("http://localhost:3000");
		cy.contains("No recommendations yet! Create your own :)");

		cy.get("[data-cy=link]").type(recommendation.youtubeLink);

		cy.intercept("POST", "http://localhost:5000/recommendations").as(
			"createRecommendation"
		);

		cy.get("[data-cy=create]").click();

		cy.wait("@createRecommendation");

		cy.on("window:alert", (alertMessage) => {
			expect(alertMessage).to.contains("Error creating recommendation!");
		});

		cy.contains("No recommendations yet! Create your own :)");
	});

	it("Should return a message error when the recommendation link is not sent", () => {
		const recommendation = {
			name: faker.lorem.words(),
			youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password()}`,
		};

		cy.visit("http://localhost:3000");
		cy.contains("No recommendations yet! Create your own :)");

		cy.get("[data-cy=name]").type(recommendation.name);

		cy.intercept("POST", "http://localhost:5000/recommendations").as(
			"createRecommendation"
		);

		cy.get("[data-cy=create]").click();

		cy.wait("@createRecommendation");

		cy.on("window:alert", (alertMessage) => {
			expect(alertMessage).to.contains("Error creating recommendation!");
		});

		cy.contains("No recommendations yet! Create your own :)");
	});

	it("Should return a message error when the recommendation name and link are not sent", () => {
		cy.visit("http://localhost:3000");
		cy.contains("No recommendations yet! Create your own :)");

		cy.intercept("POST", "http://localhost:5000/recommendations").as(
			"createRecommendation"
		);

		cy.get("[data-cy=create]").click();

		cy.wait("@createRecommendation");

		cy.on("window:alert", (alertMessage) => {
			expect(alertMessage).to.contains("Error creating recommendation!");
		});

		cy.contains("No recommendations yet! Create your own :)");
	});

	it("Should return a message error when the recommendation link is invalid", () => {
		const recommendation = {
			name: faker.lorem.words(),
			youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password()}`,
		};

		recommendation.youtubeLink = faker.internet.avatar();

		cy.visit("http://localhost:3000");
		cy.contains("No recommendations yet! Create your own :)");

		cy.get("[data-cy=name]").type(recommendation.name);
		cy.get("[data-cy=link]").type(recommendation.youtubeLink);

		cy.intercept("POST", "http://localhost:5000/recommendations").as(
			"createRecommendation"
		);

		cy.get("[data-cy=create]").click();

		cy.wait("@createRecommendation");

		cy.on("window:alert", (alertMessage) => {
			expect(alertMessage).to.contains("Error creating recommendation!");
		});

		cy.contains("No recommendations yet! Create your own :)");
	});

	it("Should increase the recommendation score", () => {
		const recommendation = {
			name: faker.lorem.words(),
			youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password()}`,
		};

		cy.visit("http://localhost:3000");
		cy.contains("No recommendations yet! Create your own :)");

		cy.get("[data-cy=name]").type(recommendation.name);
		cy.get("[data-cy=link]").type(recommendation.youtubeLink);
		cy.get("[data-cy=create]").click();

		cy.wait(3000);

		cy.getRecommendations().then(({ id }) => {
			cy.intercept(
				"POST",
				`http://localhost:5000/recommendations/${id}/upvote`
			).as("upvoteRecommendation");

			cy.get("[data-cy=arrowUp]").click();

			cy.wait("@upvoteRecommendation");

			cy.get("[data-cy=scoreContainer]").contains(1);
		});
	});

	it("Should decrement the recommendation score", () => {
		const recommendation = {
			name: faker.lorem.words(),
			youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password()}`,
		};

		cy.visit("http://localhost:3000");
		cy.contains("No recommendations yet! Create your own :)");

		cy.get("[data-cy=name]").type(recommendation.name);
		cy.get("[data-cy=link]").type(recommendation.youtubeLink);
		cy.get("[data-cy=create]").click();

		cy.wait(3000);

		cy.getRecommendations().then(({ id }) => {
			cy.intercept(
				"POST",
				`http://localhost:5000/recommendations/${id}/downvote`
			).as("downvoteRecommendation");

			cy.get("[data-cy=arrowDown]").click();

			cy.wait("@downvoteRecommendation");

			cy.get("[data-cy=scoreContainer]").contains(-1);
		});
	});

	it("Should exclude the recommendation when the score is less than -5", () => {
		const recommendation = {
			name: faker.lorem.words(),
			youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password()}`,
		};

		cy.visit("http://localhost:3000");
		cy.contains("No recommendations yet! Create your own :)");

		cy.get("[data-cy=name]").type(recommendation.name);
		cy.get("[data-cy=link]").type(recommendation.youtubeLink);
		cy.get("[data-cy=create]").click();

		cy.wait(3000);

		cy.getRecommendations().then(({ id }) => {
			cy.downvoteRecommendation(id);
			cy.downvoteRecommendation(id);
			cy.downvoteRecommendation(id);
			cy.downvoteRecommendation(id);
			cy.downvoteRecommendation(id).then(() => {
				cy.intercept(
					"POST",
					`http://localhost:5000/recommendations/${id}/downvote`
				).as("downvoteRecommendation");

				cy.get("[data-cy=arrowDown]").click();

				cy.wait("@downvoteRecommendation");

				cy.get("[data-cy=recommendationName]").should("not.exist");
				cy.get("[data-cy=scoreContainer]").should("not.exist");
			});
		});
	});

	it("Should navigate to top page", () => {
		cy.visit("http://localhost:3000/");
		cy.contains("No recommendations yet! Create your own :)");

		cy.get("[data-cy=top]").click();

		cy.url().should("equal", "http://localhost:3000/top");
		cy.contains("No recommendations yet! Create your own :)");
	});

	it("Should navigate to random page", () => {
		cy.visit("http://localhost:3000/");
		cy.contains("No recommendations yet! Create your own :)");

		cy.get("[data-cy=random]").click();

		cy.url().should("equal", "http://localhost:3000/random");
		cy.contains("Loading...");
	});
});
