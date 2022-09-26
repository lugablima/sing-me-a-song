beforeEach(async () => {
  await cy.resetDatabase();
});

describe("Test the Home page", () => {
    it("No recommendation should appear", () => {
        cy.visit('http://localhost:3000');
        cy.contains("No recommendations yet! Create your own :)");

        cy.get("[data-cy=top]").click();

        cy.url().should("equal", "http://localhost:3000/top");
        cy.contains("No recommendations yet! Create your own :)");
    });

    it("The recommendation should appear", () => {
        cy.createRecommendation().then((recommendation) => {
            cy.visit('http://localhost:3000/top');

            cy.get("[data-cy=recommendationName]").contains(recommendation.name);
            cy.get("[data-cy=scoreContainer]").contains(0);
        });
    });

    it("The recommendation with the highest score must appear first", () => {
        cy.createRecommendation().then(() => {
            cy.createRecommendation().then((recommendation) => {
                cy.visit('http://localhost:3000/top');

                cy.getRecommendations().then(({ id }) => {
                    cy.upvoteRecommendation(id).then(() => {
                        cy.get("[data-cy=recommendationName]").first().contains(recommendation.name);
                        cy.get("[data-cy=scoreContainer]").first().contains(1);
                    });
                });
            });
        });
    });

    it("The recommendation should be in second place when having its score decreased", () => {
         cy.createRecommendation().then(() => {
             cy.createRecommendation().then((recommendation) => {
                 cy.visit('http://localhost:3000/top');

                 cy.getRecommendations().then(({ id }) => {
                     cy.upvoteRecommendation(id).then(() => {
                         cy.downvoteRecommendation(id).then(() => {
                             cy.downvoteRecommendation(id).then(() => {
                                 cy.get("[data-cy=recommendationName]").last().contains(recommendation.name);
                                 cy.get("[data-cy=scoreContainer]").last().contains(-1);
                             });
                         });
                     });
                 });
             });
         });
     });

     it("Should exclude the recommendation when the score is less than -5", () => {
        let recommendation = {};
        cy.createRecommendation().then((body) => {
            recommendation = body;
        });

        cy.createRecommendation();
        cy.wait(3000);
    
        cy.getRecommendations().then(({ id }) => {
          cy.downvoteRecommendation(id);
          cy.downvoteRecommendation(id);
          cy.downvoteRecommendation(id);
          cy.downvoteRecommendation(id);
          cy.downvoteRecommendation(id).then(() => {
            cy.intercept("POST", `http://localhost:5000/recommendations/${id}/downvote`).as("downvoteRecommendation");
    
            cy.get("[data-cy=arrowDown]").last().click();
        
            cy.wait("@downvoteRecommendation");
            
            cy.get("[data-cy=recommendationName]").first().contains(recommendation.name);
            cy.get("[data-cy=scoreContainer]").first().contains(0);
          });
        });
      });
    
    it("Should navigate to home page", () => {
        cy.visit('http://localhost:3000/top');
        cy.contains("No recommendations yet! Create your own :)");

        cy.get("[data-cy=home]").click();

        cy.url().should("equal", "http://localhost:3000/");
        cy.contains("No recommendations yet! Create your own :)");
    });

    it("Should navigate to random page", () => {
        cy.visit('http://localhost:3000/top');
        cy.contains("No recommendations yet! Create your own :)");

        cy.get("[data-cy=random]").click();

        cy.url().should("equal", "http://localhost:3000/random");
        cy.contains("Loading...");
    });
});