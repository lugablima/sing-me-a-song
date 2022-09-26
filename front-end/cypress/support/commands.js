// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
import { faker } from "@faker-js/faker";

Cypress.Commands.add("resetDatabase", () => {
    return cy.request("POST", "http://localhost:5000/e2e/reset", {});
});

Cypress.Commands.add("createRecommendationBody", () => {
    const recommendation = {
        name: faker.lorem.words(),
        youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password()}`,
    }

    return cy.wrap(recommendation);
});

Cypress.Commands.add("createRecommendation", () => {
    const recommendation = {
        name: faker.lorem.words(),
        youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password()}`,
    }

    cy.request("POST", "http://localhost:5000/recommendations", recommendation);
});

Cypress.Commands.add("getRecommendations", () => {
    cy.request("GET", "http://localhost:5000/recommendations").then((data) => {
        return cy.wrap(data.body[0]);
    });
});

Cypress.Commands.add("downvoteRecommendation", recommendationId => {
    cy.request("POST", `http://localhost:5000/recommendations/${recommendationId}/downvote`);
});
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })