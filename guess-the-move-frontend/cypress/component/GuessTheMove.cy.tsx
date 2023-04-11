import GuessTheMove from '../../src/app/guess/page';

describe('GuessTheMove.cy.tsx', () => {
  beforeEach(() => {
    cy.viewport(1024, 768)
  });

  it('should render chess board', () => {
    cy.mount(<GuessTheMove />);

    cy.get('.black').should('have.length', 16);
    cy.get('.black.rook').should('have.length', 2);
    cy.get('.black.knight').should('have.length', 2);
    cy.get('.black.bishop').should('have.length', 2);
    cy.get('.black.king').should('have.length', 1);
    cy.get('.black.queen').should('have.length', 1);
    cy.get('.black.pawn').should('have.length', 8);

    cy.get('.white').should('have.length', 16);
    cy.get('.white.rook').should('have.length', 2);
    cy.get('.white.knight').should('have.length', 2);
    cy.get('.white.bishop').should('have.length', 2);
    cy.get('.white.king').should('have.length', 1);
    cy.get('.white.queen').should('have.length', 1);
    cy.get('.white.pawn').should('have.length', 8);
  });

  it('should only allow legal moves', async () => {
    cy.mount(<GuessTheMove />);

    // cy.get('.white.pawn').eq(4).then(element => {
    //   cy.wrap(element).trigger('touchstart');
    // });
    // cy.get('.white.pawn').eq(4).click({ force: true });
    // cy.get('.white.pawn').eq(2).click({ force: true });
    cy.get('.white.pawn').eq(4).trigger('mousedown', { force: true });
    cy.get('.white.pawn').eq(4).trigger('mouseup', { force: true });

    cy.get('.black.pawn').eq(4).trigger('mousedown', { force: true });
    cy.get('.black.pawn').eq(4).trigger('mouseup', { force: true });

    cy.wait(1000).then(() => {
      cy.get('.black').should('have.length', 16);
    });

    // cy.get('.white.pawn').eq(2).trigger('touchstart', { force: true });
    // cy.get('.white.pawn').eq(4).trigger('touchstart', { force: true });
  });
})