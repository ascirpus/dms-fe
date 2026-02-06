/// <reference types="cypress" />

// Custom command to login
Cypress.Commands.add('login', (username?: string, password?: string) => {
  const user = username || Cypress.env('TEST_USERNAME') || 'testuser';
  const pass = password || Cypress.env('TEST_PASSWORD') || 'testpass';

  // Visit login page
  cy.visit('/login');

  // Fill in credentials and submit
  cy.get('input[type="text"]').type(user);
  cy.get('input[type="password"]').type(pass);
  cy.get('button[type="submit"]').click();

  // Wait for redirect to dashboard
  cy.url().should('not.include', '/login');
});

// Custom command to intercept API calls
Cypress.Commands.add('mockApi', (method: string, url: string, response: any) => {
  cy.intercept(method, url, response).as('apiCall');
});

// Add TypeScript definitions
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login to the application
       * @example cy.login('user@example.com', 'password')
       */
      login(username?: string, password?: string): Chainable<void>;

      /**
       * Custom command to mock API calls
       * @example cy.mockApi('GET', '/api/projects', { data: [] })
       */
      mockApi(method: string, url: string, response: any): Chainable<void>;
    }
  }
}

export {};
