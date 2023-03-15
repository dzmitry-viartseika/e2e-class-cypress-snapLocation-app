/// <reference types="cypress" />

const SET_TIME_OUT_TIME = 1000;

describe('share location', () => {

  beforeEach(() => {
    cy.visit('/').then((win) => {
      cy.stub(win.navigator.geolocation, 'getCurrentPosition').as('getUserPosition').callsFake((cb) => {
        setTimeout(() => {
          cb({
            coords: {
              latitude: 37.45,
              longitude: 48.01,
            },
          });
        }, SET_TIME_OUT_TIME)
      })
      cy.get('[data-cy="get-loc-btn"]').as('getLocButton');
      cy.get('[data-cy="share-loc-btn"]').as('shareLocButton');
      cy.get('[data-cy="actions"]').as('actionsDiv');
    })
  })

  it('should fetch the user location', () => {
    const LOCATION_FETCH_TEXT = 'Location fetched';
    const ERROR_TEXT = 'Please enter your name and get your location first!';
    cy.get('@getLocButton').click();
    cy.get('@getUserPosition').should('have.been.called');
    cy.get('@getLocButton').should('be.disabled');
    cy.get('@actionsDiv').contains(LOCATION_FETCH_TEXT);
    cy.get('@shareLocButton').click();
    cy.get('#error').should('contain', ERROR_TEXT);
  });

  it('should share a location link', () => {
    cy.get('[data-cy="name-input"]').type('Dzmitry');
    cy.get('@getLocButton').click();
  })
});
