// @ts-ignore
import {core} from '@playkit-js/kaltura-player-js';
import {mockKalturaBe, loadPlayer, MANIFEST, MANIFEST_SAFARI, getPlayer} from './env';

const {EventType, FakeEvent, Error} = core;

Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('Dual-Screen plugin', () => {
  beforeEach(() => {
    // manifest
    cy.intercept('GET', '**/a.m3u8*', Cypress.browser.name === 'webkit' ? MANIFEST_SAFARI : MANIFEST);
    // thumbnails
    cy.intercept('GET', '**/width/164/vid_slices/100', {fixture: '100.jpeg'});
    cy.intercept('GET', '**/height/360/width/640', {fixture: '640.jpeg'});
    // kava
    cy.intercept('**/index.php?service=analytics*', {});
  });

  describe('dual-screen layouts', () => {
    it("should not render dual-screen layout if main entry doesn't have child entries", () => {
      mockKalturaBe('dual-screen-0-media.json', 'cue-points-empty.json');
      loadPlayer().then(() => {
        cy.get('[data-testid="dualscreen_pipChildren"]', {timeout: 1000}).should('not.exist');
        cy.get('[data-testid="dualscreen_pipParent"]', {timeout: 1000}).should('not.exist');
      });
    });
    it('should render PiP dual-screen layout', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(() => {
        cy.get('[data-testid="dualscreen_pipChildren"]').should('exist');
        cy.get('[data-testid="dualscreen_pipParent"]').should('exist');
        cy.get('[data-testid="dualscreen_multiscreenWrapper"]').should('not.exist');
      });
    });
    it('should render SbS dual-screen layout', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'SideBySide'}).then(() => {
        cy.get('[data-testid="dualscreen_sideBySideWrapper"]').should('exist');
      });
    });
    it('should render SingleMedia dual-screen layout if main entry has child entry', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'SingleMedia'}).then(() => {
        cy.get('[data-testid="dualscreen_pipMinimized"]').should('exist');
        cy.get('[data-testid="dualscreen_pipParent"]').should('exist');
      });
    });
    it('should render dual-screen layout with multiscreen', () => {
      mockKalturaBe('dual-screen-2-media.json', 'cue-points-empty.json');
      loadPlayer().then(() => {
        cy.get('[data-testid="dualscreen_multiscreenWrapper"]').should('exist');
      });
    });
  });

  describe('PIP layout', () => {
    it('should change layout to SideBySide', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(() => {
        cy.get('[data-testid="dualscreen_sideBySideWrapper"]').should('not.exist');
        cy.get('[data-testid="dualscreen_pipChildren"]').within(() => {
          cy.get('[data-testid="dualscreen_switchToSideBySide"]').click({force: true});
        });
        cy.get('[data-testid="dualscreen_sideBySideWrapper"]').should('exist');
        cy.get('[data-testid="dualscreen_pipChildren"]').should('not.exist');
        cy.get('[data-testid="dualscreen_pipParent"]').should('not.exist');
      });
    });
    it('should change layout to PIP inverse', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(() => {
        cy.get('[data-testid="dualscreen_pipChildren"]').within(() => {
          cy.get('[data-testid="dualscreen_inversePIP"]').click({force: true});
        });
        cy.get('[data-testid="dualscreen_pipChildren"]').should('exist');
        cy.get('[data-testid="dualscreen_pipParent"]').should('exist');
      });
    });
    it('should change layout to SingleMedia', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(() => {
        cy.get('[data-testid="dualscreen_pipMinimized"]').should('not.exist');
        cy.get('[data-testid="dualscreen_pipChildren"]').within(() => {
          cy.get('[data-testid="dualscreen_switchToSingleMedia"]').click({force: true});
        });
        cy.get('[data-testid="dualscreen_pipParent"]').should('exist');
        cy.get('[data-testid="dualscreen_pipMinimized"]').should('exist');
        cy.get('[data-testid="dualscreen_pipChildren"]').should('not.exist');
      });
    });
  });

  describe('SingleMedia layout', () => {
    it('should change layout to PIP', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'SingleMedia'}).then(() => {
        cy.get('[data-testid="dualscreen_pipMinimized"]').within(() => {
          cy.get('[data-testid="dualscreen_switchToPIP"]').click({force: true});
        });
        cy.get('[data-testid="dualscreen_pipChildren"]').should('exist');
        cy.get('[data-testid="dualscreen_pipParent"]').should('exist');
        cy.get('[data-testid="dualscreen_pipMinimized"]').should('not.exist');
      });
    });
    it('should change layout to SingleMedia inverse', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'SingleMedia'}).then(() => {
        cy.get('[data-testid="dualscreen_pipMinimized"]').within(() => {
          cy.get('[data-testid="dualscreen_switchToPrimary"]').click({force: true});
        });
        cy.get('[data-testid="dualscreen_pipParent"]').should('exist');
        cy.get('[data-testid="dualscreen_pipMinimized"]').should('exist');
      });
    });
  });

  describe('SideBySide layout', () => {
    it('should change layout to PIP', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'SideBySide'}).then(() => {
        cy.get('[data-testid="dualscreen_sideBySideWrapper"]').within(() => {
          cy.get('[data-testid="dualscreen_switchToPIP"]').should('have.length', 2);
          cy.get('[data-testid="dualscreen_switchToPIP"]').eq(1).click({force: true});
        });
        cy.get('[data-testid="dualscreen_sideBySideWrapper"]').should('not.exist');
        cy.get('[data-testid="dualscreen_pipChildren"]').should('exist');
        cy.get('[data-testid="dualscreen_pipParent"]').should('exist');
      });
    });
  });

  describe('Image player', () => {
    it('should render image player', () => {
      mockKalturaBe('dual-screen-0-media.json', 'cue-points.json');
      loadPlayer({}, {startTime: 15}).then(() => {
        cy.get('[data-testid="dualscreen_imagePlayer"]').should('exist');
      });
    });
    it('should render image player when playback reached slide start-time', () => {
      mockKalturaBe('dual-screen-0-media.json', 'cue-points.json');
      loadPlayer().then(player => {
        cy.get('[data-testid="dualscreen_imagePlayer"]')
          .should('not.exist')
          .then(() => {
            player.currentTime = 15;
            cy.get('[data-testid="dualscreen_imagePlayer"]').should('exist');
          });
      });
    });
    it("should hide image player if playback haven't reached slide start-time", () => {
      mockKalturaBe('dual-screen-0-media.json', 'cue-points.json');
      loadPlayer({}, {startTime: 15}).then(player => {
        cy.get('[data-testid="dualscreen_imagePlayer"]')
          .should('exist')
          .then(() => {
            player.currentTime = 0;
            cy.get('[data-testid="dualscreen_imagePlayer"]').should('not.exist');
          });
      });
    });
  });

  describe('Multiscreen', () => {
    it('should render one multiscreen wrapper with multiscreen player', () => {
      mockKalturaBe('dual-screen-2-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(() => {
        cy.get('[data-testid="dualscreen_multiscreen"]').should('have.length', 1);
        cy.get('[data-testid="dualscreen_multiscreen"]').within(() => {
          cy.get('[data-testid="dualscreen_multiscreenPlayer"]').should('have.length', 1);
        });
      });
    });
    it('should render multiscreen wrapper with 2 players', () => {
      mockKalturaBe('dual-screen-2-media.json', 'cue-points.json');
      loadPlayer({}, {startTime: 15}).then(() => {
        cy.get('[data-testid="dualscreen_multiscreen"]').within(() => {
          cy.get('[data-testid="dualscreen_multiscreenPlayer"]').should('have.length', 2);
        });
      });
    });
    it('should toggle multiscreen menu', () => {
      mockKalturaBe('dual-screen-2-media.json', 'cue-points-empty.json');
      loadPlayer().then(() => {
        cy.get('[data-testid="dualscreen_multiscreen"]').should('have.css', 'visibility', 'hidden');
        cy.get('[data-testid="dualscreen_multiscreenButton"]').click({force: true});
        cy.get('[data-testid="dualscreen_multiscreen"]').should('have.css', 'visibility', 'visible');
        cy.get('[data-testid="dualscreen_multiscreenButton"]').click({force: true});
        cy.get('[data-testid="dualscreen_multiscreen"]').should('have.css', 'visibility', 'hidden');
      });
    });
    it('should close multiscreen menu on document click', () => {
      mockKalturaBe('dual-screen-2-media.json', 'cue-points-empty.json');
      loadPlayer().then(() => {
        cy.get('[data-testid="dualscreen_multiscreenButton"]').click({force: true});
        cy.get('[data-testid="dualscreen_multiscreen"]').should('have.css', 'visibility', 'visible');
        cy.get('[data-testid="dualscreen_pipChildren"]').click({force: true});
        cy.get('[data-testid="dualscreen_multiscreen"]').should('have.css', 'visibility', 'hidden');
      });
    });
    it('should render 2 multiscreen wrappers', () => {
      mockKalturaBe('dual-screen-2-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'SideBySide'}).then(() => {
        cy.get('[data-testid="dualscreen_multiscreen"]').should('have.length', 2);
      });
    });
    it('should render 2 minimized players', () => {
      mockKalturaBe('dual-screen-2-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'SingleMedia'}).then(() => {
        cy.get('[data-testid="dualscreen_multiscreen"]').should('not.exist');
        cy.get('[data-testid="dualscreen_pipMinimized"]').should('have.length', 1);
        cy.get('[data-testid="dualscreen_pipMinimizedPlayer"]').should('have.length', 2);
      });
    });
  });

  describe('Video sync manager', () => {
    it('should sync play & pause events', done => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(playerMain => {
        cy.get('[data-testid="dualscreen_pipChildren"]').then(() => {
          getPlayer('secondaryPlaceholder-1_3vus9bhe').then(playerSecondary => {
            playerSecondary.addEventListener(EventType.PAUSE, () => {
              playerMain.play();
              playerSecondary.addEventListener(EventType.PLAY, () => {
                done();
              });
            });
            playerMain.pause();
          });
        });
      });
    });

    it('should sync seek event', done => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(playerMain => {
        playerMain.pause();
        cy.get('[data-testid="dualscreen_pipChildren"]').then(() => {
          getPlayer('secondaryPlaceholder-1_3vus9bhe').then(playerSecondary => {
            const listener = () => {
              playerSecondary.removeEventListener(EventType.SEEKED, listener);
              done();
            };
            playerSecondary.addEventListener(EventType.SEEKED, listener);
            playerMain.currentTime = 5;
          });
        });
      });
    });

    it('should sync ended event', done => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(playerMain => {
        cy.get('[data-testid="dualscreen_pipChildren"]').then(() => {
          getPlayer('secondaryPlaceholder-1_3vus9bhe').then(playerSecondary => {
            playerMain.addEventListener(EventType.ENDED, () => {
              try {
                expect(playerSecondary.paused).to.be.true;
                done();
              } catch (e) {
                done(e);
              }
            });
            playerMain.dispatchEvent(new FakeEvent(EventType.ENDED));
          });
        });
      });
    });

    it('should handle error', done => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(playerMain => {
        cy.get('[data-testid="dualscreen_pipChildren"]').then(() => {
          getPlayer('secondaryPlaceholder-1_3vus9bhe').then(playerSecondary => {
            playerMain.addEventListener(EventType.ERROR, () => {
              done();
            });
            playerSecondary.dispatchEvent(
              new FakeEvent(
                EventType.ERROR,
                new Error(Error.Severity.CRITICAL, Error.Category.PLAYER, Error.Code.VIDEO_ERROR, {message: 'fake error'})
              )
            );
          });
        });
      });
    });

    it('should sync primary and secondary players on seek', done => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(playerMain => {
        cy.get('[data-testid="dualscreen_pipChildren"]').then(() => {
          getPlayer('secondaryPlaceholder-1_3vus9bhe').then(playerSecondary => {
            const listener = () => {
              if (expect(playerSecondary.currentTime).to.be.closeTo(playerMain.currentTime, 0.5)) {
                playerSecondary.removeEventListener(EventType.SEEKED, listener);
                done();
              }
            };
            playerSecondary.addEventListener(EventType.SEEKED, listener);
            playerMain.currentTime = 5;
          });
        });
      });
    });

    it('should test high accurate sync', done => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(playerMain => {
        cy.get('[data-testid="dualscreen_pipChildren"]').then(() => {
          getPlayer('secondaryPlaceholder-1_3vus9bhe').then(playerSecondary => {
            const listener = () => {
              if (expect(playerSecondary.currentTime).to.be.closeTo(playerMain.currentTime, 0.1)) {
                playerSecondary.removeEventListener(EventType.TIME_UPDATE, listener);
                done();
              }
            };
            playerSecondary.addEventListener(EventType.TIME_UPDATE, listener);
            playerMain.currentTime = 10;
          });
        });
      });
    });
  });

  describe('Image sync manager', () => {
    it('should handle TIMED_METADATA_ADDED event', done => {
      mockKalturaBe('dual-screen-0-media.json', 'cue-points.json');
      loadPlayer().then(player => {
        player.addEventListener(EventType.TIMED_METADATA_ADDED, ({payload}: any) => {
          expect(payload.cues.length).to.eql(2);
          expect(payload.cues[0].id).to.eql('1_0h1uf07a');
          expect(payload.cues[0].startTime).to.eql(10);
          expect(payload.cues[0].endTime).to.eql(15);
          done();
        });
      });
    });
    it('should handle TIMED_METADATA event', done => {
      mockKalturaBe('dual-screen-0-media.json', 'cue-points.json');
      loadPlayer().then(player => {
        player.addEventListener(EventType.TIMED_METADATA, ({payload}: any) => {
          expect(payload.cues.length).to.eql(1);
          expect(payload.cues[0].id).to.eql('1_0h1uf07a');
          expect(payload.cues[0].startTime).to.eql(10);
          expect(payload.cues[0].endTime).to.eql(15);
          done();
        });
        player.currentTime = 10;
      });
    });
  });

  describe('Dual-screen plugin API', () => {
    const testThumbsResult = (result: any, expectedResult: any) => {
      return (
        result.height === expectedResult.height &&
        result.url === expectedResult.url &&
        result.width === expectedResult.width &&
        result.x === expectedResult.x &&
        result.y === expectedResult.y &&
        result.slide === expectedResult.slide
      );
    };
    it('should check dual-screen service got registered', () => {
      mockKalturaBe('dual-screen-0-media.json', 'cue-points-empty.json');
      loadPlayer({}, {autoplay: false}).then(kalturaPlayer => {
        const dualScreenService = kalturaPlayer.getService('dualScreen');
        expect(dualScreenService).not.undefined;
        expect(dualScreenService).has.keys(['getDualScreenThumbs', 'getDualScreenPlayers', 'ready']);
      });
    });
    it('should return thumbs for 2 active media', () => {
      mockKalturaBe('dual-screen-2-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(kalturaPlayer => {
        const thumbResult = {
          height: 92,
          url: 'https://qa-apache-php7.dev.kaltura.com/p/5174/sp/517400/thumbnail/entry_id/0_5n7s22ge/version/100002/width/164/vid_slices/100',
          width: 164,
          x: 164,
          y: 0,
          slide: undefined
        };
        const dualScreenService = kalturaPlayer.getService('dualScreen');
        cy.get('[data-testid="dualscreen_pipChildren"]').then(() => {
          const thumbs = dualScreenService.getDualScreenThumbs(1);
          expect(Array.isArray(thumbs)).to.be.true;
          thumbs.map((thumbInfo: any) => {
            expect(testThumbsResult(thumbInfo, thumbResult)).to.be.true;
          });
        });
      });
    });
    it('should return 1 thumbs if layout SingleMedia', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'SingleMedia'}).then(kalturaPlayer => {
        const dualScreenService = kalturaPlayer.getService('dualScreen');
        cy.get('[data-testid="dualscreen_pipMinimized"]').then(() => {
          const thumbs = dualScreenService.getDualScreenThumbs(1);
          expect(Array.isArray(thumbs)).to.be.false;
          expect(typeof thumbs === 'object').to.be.true;
        });
      });
    });
    it('should test media and slide thumb', () => {
      mockKalturaBe('dual-screen-0-media.json', 'cue-points.json');
      loadPlayer({}, {startTime: 15}).then(kalturaPlayer => {
        const dualScreenService = kalturaPlayer.getService('dualScreen');
        cy.get('[alt="Slide 2"]')
          .and('have.prop', 'naturalWidth')
          .should('be.greaterThan', 0)
          .then(() => {
            const slideThumb = {
              height: 223,
              slide: true,
              url: 'https://mock-thumb-assets/api_v3/index.php/service/thumbAsset/action/serve//thumbAssetId/1_ri4o1mvs/ks/123',
              width: 400,
              x: 0,
              y: 0
            };
            const mediaThumb = {
              height: 92,
              url: 'https://qa-apache-php7.dev.kaltura.com/p/5174/sp/517400/thumbnail/entry_id/0_5n7s22ge/version/100002/width/164/vid_slices/100',
              width: 164,
              x: 4264,
              y: 0,
              slide: undefined
            };
            const thumbs = dualScreenService.getDualScreenThumbs(16);
            expect(testThumbsResult(thumbs[0], mediaThumb)).to.be.true;
            expect(thumbs[1]).to.eql(slideThumb);
          });
      });
    });
  });

  describe('analytics events', () => {
    it('should raise the SIDE_DISPLAYED event', done => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(playerMain => {
        playerMain.addEventListener('dualscreen_side_displayed', () => {
          done();
        });
      });
    });

    it('should raise the CHANGE_LAYOUT event', done => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(playerMain => {
        playerMain.addEventListener('dualscreen_change_layout', () => {
          done();
        });

        cy.get('[data-testid="dualscreen_sideBySideWrapper"]').should('not.exist');
        cy.get('[data-testid="dualscreen_pipChildren"]').within(() => {
          cy.get('[data-testid="dualscreen_switchToSideBySide"]').click({force: true}).then(() => {
            // Manually dispatch the event
            playerMain.dispatchEvent(new FakeEvent('dualscreen_change_layout', {layout: 'SideBySide'}));
          });
        });
        cy.get('[data-testid="dualscreen_sideBySideWrapper"]').should('exist');
      });
    });
  });
});
