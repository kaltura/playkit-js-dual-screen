import {mockKalturaBe, loadPlayer, MANIFEST, MANIFEST_SAFARI} from './env';

describe('Dual-Screen plugin', () => {
  beforeEach(() => {
    // manifest
    cy.intercept('GET', '**/a.m3u8*', Cypress.browser.name === 'webkit' ? MANIFEST_SAFARI : MANIFEST);
    // thumbnails
    cy.intercept('GET', '**/width/164/vid_slices/100', {fixture: '100.jpeg'});
    cy.intercept('GET', '**/height/360/width/640', {fixture: '640.jpeg'});
    // kava
    cy.intercept('GET', '**/index.php?service=analytics*', {});
  });

  describe('dual-screen layout', () => {
    it("should not render dual-screen layout if main entry doesn't have child entries", () => {
      mockKalturaBe('dual-screen-0-media.json', 'cue-points-empty.json');
      loadPlayer().then(() => {
        cy.get('[data-testid="dualscreen_pipChildren"]').should('not.exist');
        cy.get('[data-testid="dualscreen_pipParent"]').should('not.exist');
      });
    });
  });
});
