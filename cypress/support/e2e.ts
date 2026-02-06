// ***********************************************************
// This support file is loaded before all test files
// ***********************************************************

import './commands';

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent the error from failing the test
  // Useful for handling third-party script errors
  return false;
});
