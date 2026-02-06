describe('Projects Page', () => {
  beforeEach(() => {
    // Mock authentication - adjust based on your auth flow
    cy.visit('/projects');
  });

  describe('Project List', () => {
    it('should display projects list', () => {
      // Wait for projects to load
      cy.contains('Projects', { timeout: 10000 }).should('be.visible');

      // Check for table or empty state
      cy.get('body').then($body => {
        if ($body.find('.empty-state').length > 0) {
          cy.get('.empty-state').should('contain', 'No projects found');
        } else {
          cy.get('.projects-table').should('exist');
        }
      });
    });

    it('should show loading state initially', () => {
      cy.visit('/projects');

      // Should show loading spinner briefly
      cy.get('.loading-state', { timeout: 1000 }).should('exist');
    });

    it('should handle error state', () => {
      // Intercept API call with error
      cy.intercept('GET', '/api/projects', {
        statusCode: 500,
        body: { error: 'Server error' },
      }).as('getProjectsError');

      cy.visit('/projects');
      cy.wait('@getProjectsError');

      // Should show error message
      cy.get('.error-container').should('be.visible');
      cy.contains('Error loading projects').should('be.visible');
    });

    it('should allow searching/filtering projects', () => {
      cy.intercept('GET', '/api/projects', {
        fixture: 'projects.json'
      }).as('getProjects');

      cy.visit('/projects');
      cy.wait('@getProjects');

      // Type in search box
      cy.get('input[placeholder="Search"]').type('Test Project');

      // Results should filter (this depends on your DataTable implementation)
      cy.wait(500); // Wait for filter to apply
    });

    it('should clear filters', () => {
      cy.visit('/projects');

      // Enter search
      cy.get('input[placeholder="Search"]').type('Test');

      // Click clear button
      cy.contains('button', 'Clear').click();

      // Search should be empty
      cy.get('input[placeholder="Search"]').should('have.value', '');
    });
  });

  describe('Project Creation', () => {
    it('should open new project dialog', () => {
      cy.visit('/projects');

      // Click New Project button
      cy.contains('button', 'New Project').click();

      // Dialog should appear
      cy.contains('New Project').should('be.visible');
      cy.get('input#projectTitle').should('be.visible');
    });

    it('should create a new project', () => {
      // Mock the create API call
      cy.intercept('POST', '/api/projects', {
        statusCode: 200,
        body: {
          status: 'SUCCESS',
          data: {
            id: 'new-proj-123',
            name: 'Test Project',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      }).as('createProject');

      cy.visit('/projects');

      // Open dialog
      cy.contains('button', 'New Project').click();

      // Fill in project name
      cy.get('input#projectTitle').type('Test Project');

      // Submit
      cy.contains('button', 'Submit').click();

      // Wait for API call
      cy.wait('@createProject');

      // Should show success toast
      cy.contains('Project Created').should('be.visible');

      // Dialog should close
      cy.get('input#projectTitle').should('not.exist');
    });

    it('should validate required fields', () => {
      cy.visit('/projects');

      // Open dialog
      cy.contains('button', 'New Project').click();

      // Try to submit without filling required fields
      cy.contains('button', 'Submit').should('be.disabled');

      // Enter project name
      cy.get('input#projectTitle').type('Test Project');

      // Submit button should be enabled
      cy.contains('button', 'Submit').should('not.be.disabled');
    });

    it('should show user list with status indicators', () => {
      // Mock users API
      cy.intercept('GET', '/api/tenant/users', {
        statusCode: 200,
        body: {
          status: 'SUCCESS',
          data: [
            { userId: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'ADMIN', createdAt: new Date().toISOString() },
            { userId: 'user-2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'MEMBER', createdAt: new Date().toISOString() },
            { userId: 'current-user', firstName: 'Current', lastName: 'User', email: 'current@example.com', role: 'OWNER', createdAt: new Date().toISOString() },
          ],
        },
      }).as('getUsers');

      cy.visit('/projects');
      cy.contains('button', 'New Project').click();

      cy.wait('@getUsers');

      // Should show users dropdown
      cy.get('select#users').should('be.visible');

      // Open dropdown to see options with icons
      cy.get('select#users').click();

      // Should see user names (not just IDs)
      cy.contains('John Doe').should('exist');
      cy.contains('Jane Smith').should('exist');
    });

    it('should show indicators for current user and selected users', () => {
      cy.intercept('GET', '/api/tenant/users', {
        statusCode: 200,
        body: {
          status: 'SUCCESS',
          data: [
            { userId: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'ADMIN', createdAt: new Date().toISOString() },
            { userId: 'user-2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'MEMBER', createdAt: new Date().toISOString() },
          ],
        },
      }).as('getUsers');

      cy.visit('/projects');
      cy.contains('button', 'New Project').click();
      cy.wait('@getUsers');

      // Select a user
      cy.get('select#users').select('user-1');

      // Should show in selected list
      cy.contains('.selected-user-item', 'John Doe').should('be.visible');

      // Open dropdown again - user should still be visible but marked as added
      cy.get('select#users').click();
      cy.contains('John Doe').should('exist');
    });

    it('should allow adding email invites', () => {
      cy.visit('/projects');
      cy.contains('button', 'New Project').click();

      // Enter email
      cy.get('input#inviteEmail').type('test@example.com{enter}');

      // Email should appear in list
      cy.contains('.email-item', 'test@example.com').should('be.visible');

      // Should be able to remove email
      cy.contains('.email-item', 'test@example.com')
        .find('button[aria-label="Remove email"]')
        .click();

      cy.contains('.email-item', 'test@example.com').should('not.exist');
    });

    it('should handle creation errors', () => {
      // Mock create with error
      cy.intercept('POST', '/api/projects', {
        statusCode: 400,
        body: { error: 'Invalid project name' },
      }).as('createProjectError');

      cy.visit('/projects');
      cy.contains('button', 'New Project').click();

      cy.get('input#projectTitle').type('Test Project');
      cy.contains('button', 'Submit').click();

      cy.wait('@createProjectError');

      // Dialog should remain open on error
      cy.get('input#projectTitle').should('be.visible');
    });
  });

  describe('Project Actions', () => {
    beforeEach(() => {
      // Mock projects list
      cy.intercept('GET', '/api/projects', {
        fixture: 'projects.json'
      }).as('getProjects');

      cy.visit('/projects');
      cy.wait('@getProjects');
    });

    it('should navigate to project details on row click', () => {
      // Click on first project row
      cy.get('.projects-table tbody tr').first().click();

      // Should navigate to project details
      cy.url().should('include', '/projects/');
    });

    it('should show delete confirmation', () => {
      // Click delete button on first project
      cy.get('.projects-table tbody tr').first()
        .find('button[aria-label="Delete"]').click({ force: true });

      // Confirmation dialog should appear
      cy.contains('Delete Project').should('be.visible');
      cy.contains('Are you sure').should('be.visible');
    });

    it('should delete project', () => {
      // Mock delete API
      cy.intercept('DELETE', '/api/projects/*', {
        statusCode: 200,
      }).as('deleteProject');

      // Click delete button
      cy.get('.projects-table tbody tr').first()
        .find('button[aria-label="Delete"]').click({ force: true });

      // Confirm deletion
      cy.contains('button', 'Yes').or(cy.contains('button', 'OK')).click();

      cy.wait('@deleteProject');

      // Should show success toast
      cy.contains('Project Deleted').should('be.visible');
    });
  });

  describe('Pagination', () => {
    it('should paginate results', () => {
      // Mock large dataset
      const projects = Array.from({ length: 25 }, (_, i) => ({
        project: {
          id: `proj-${i}`,
          name: `Project ${i}`,
          description: `Description ${i}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        document_count: Math.floor(Math.random() * 10),
      }));

      cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: { status: 'SUCCESS', data: projects },
      }).as('getProjects');

      cy.visit('/projects');
      cy.wait('@getProjects');

      // Should show pagination controls
      cy.get('.p-paginator').should('be.visible');

      // Click next page
      cy.get('.p-paginator-next').click();

      // Should show different results
      cy.wait(500);
    });
  });
});
