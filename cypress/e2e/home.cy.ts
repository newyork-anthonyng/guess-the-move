describe('template spec', () => {
  it('passes', () => {
    cy.visit('/');

    const $getStartedLink = cy.get('a').contains('get started', { matchCase: false });
    $getStartedLink.click();

    cy.url().should('include', '/import');
  })
});

export {};