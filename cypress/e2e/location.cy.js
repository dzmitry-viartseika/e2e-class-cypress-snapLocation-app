/// <reference types="cypress" />
const TIMER = 2000;

describe('share location', () => {

  beforeEach(() => {
    cy.clock();
    cy.fixture('user-location.json').as('userLocation');
    cy.visit('/').then((win) => {
      cy.get('@userLocation').then(fakePostion => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').as('getUserPosition').callsFake((cb) => {
          setTimeout(() => {
            cb(fakePostion);
          }, TIMER)
        })
      })
      cy.get('[data-cy="get-loc-btn"]').as('getLocButton');
      cy.get('[data-cy="share-loc-btn"]').as('shareLocButton');
      cy.get('[data-cy="actions"]').as('actionsDiv');
      cy.stub(win.navigator.clipboard, 'writeText').as('saveToClipboard').resolves()
      cy.spy(win.localStorage, 'setItem').as('storeLocation');
      cy.spy(win.localStorage, 'getItem').as('getStoredLocation');
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
    const TOOLTIP_SUCCESS_TEXT = 'Location URL copied to clipboard.';
    const TOOLTIP_STORED_TEXT = 'Stored location URL copied to clipboard.';
    cy.get('[data-cy="name-input"]').type('Dzmitry');
    cy.get('@getLocButton').click();
    cy.get('@shareLocButton').click();
    cy.get('@saveToClipboard').should('have.been.called');
    cy.get('[data-cy="info-message"]').contains(TOOLTIP_SUCCESS_TEXT);
    cy.get('@userLocation').then((fakePosition) => {
      const { latitude, longitude } = fakePosition.coords;
      cy.get('@saveToClipboard')
          .should('have.been.calledWithMatch', new RegExp(`${latitude}.*${longitude}.*${encodeURI('Dzmitry')}`));
      cy.get('@storeLocation').should('have.been.calledWithMatch', /Dzmitry/, new RegExp(`${latitude}.*${longitude}.*${encodeURI('Dzmitry')}`));
    });
    cy.get('@storeLocation').should('have.been.called');
    cy.get('@shareLocButton').click();
    cy.get('@getStoredLocation').should('have.been.called');
    cy.get('[data-cy="info-message"]').should('be.visible');
    cy.get('[data-cy="info-message"]').should('have.class', 'visible');
    cy.get('[data-cy="info-message"]').contains(TOOLTIP_STORED_TEXT);
    cy.tick(TIMER);
    cy.get('[data-cy="info-message"]').should('not.be.visible');
  });
});
