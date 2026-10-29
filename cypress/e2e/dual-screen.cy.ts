// @ts-ignore
import {core} from '@playkit-js/kaltura-player-js';
import {mockKalturaBe, loadPlayer, createPlayer, setupPlayer, MANIFEST, MANIFEST_SAFARI, getPlayer} from './env';

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
        (expectedResult.height === undefined || result.height === expectedResult.height) &&
        result.url === expectedResult.url &&
        result.width === expectedResult.width &&
        (expectedResult.x === undefined || result.x === expectedResult.x) &&
        result.y === expectedResult.y &&
        result.slide === expectedResult.slide
      );
    };
    it('should check dual-screen service got registered', () => {
      mockKalturaBe('dual-screen-0-media.json', 'cue-points-empty.json');
      loadPlayer({}, {autoplay: false}).then(kalturaPlayer => {
        const dualScreenService = kalturaPlayer.getService('dualScreen');
        expect(dualScreenService).not.undefined;
        expect(dualScreenService).has.keys(['getDualScreenThumbs', 'getDualScreenPlayers','getActivePlayer', 'getPipPlayer', 'ready']);
      });
    });
    it('should return thumbs for 2 active media', () => {
      mockKalturaBe('dual-screen-2-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(kalturaPlayer => {
        const thumbResult = {
          url: 'https://qa-apache-php7.dev.kaltura.com/p/5174/sp/517400/thumbnail/entry_id/0_5n7s22ge/version/100002/width/164/vid_slices/100',
          width: 164,
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
              url: 'https://qa-apache-php7.dev.kaltura.com/p/5174/sp/517400/thumbnail/entry_id/0_5n7s22ge/version/100002/width/164/vid_slices/100',
              width: 164,
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

  describe('destroy and recreate on the same page', () => {
    const SECONDARY_ENTRY_ID = '1_3vus9bhe';
    const PLACEHOLDER_ID = `secondaryPlaceholder-${SECONDARY_ENTRY_ID}`;

    it('should remove the secondary player and its placeholder on destroy and load the secondary stream again on recreate', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(kalturaPlayer => {
        cy.get('[data-testid="dualscreen_pipChildren"]').should('exist');
        cy.window().then(win => {
          // @ts-ignore
          expect(win.KalturaPlayer.getPlayers()[PLACEHOLDER_ID], 'secondary player is registered').to.exist;
          expect(win.document.getElementById(PLACEHOLDER_ID), 'placeholder exists').to.exist;

          kalturaPlayer.destroy();

          // @ts-ignore
          expect(win.KalturaPlayer.getPlayers()[PLACEHOLDER_ID], 'secondary player is removed from the registry').to.not.exist;
          expect(win.document.getElementById(PLACEHOLDER_ID), 'placeholder is removed').to.not.exist;
        });
        cy.get('[data-testid="dualscreen_pipChildren"]').should('not.exist');

        cy.window().then(win => setupPlayer(win, {layout: 'PIP'}));
        cy.get('[data-testid="dualscreen_pipChildren"]').should('exist');
        cy.get('[data-testid="dualscreen_pipParent"]').should('exist');
        cy.window().then(win => {
          // @ts-ignore
          const recreatedPlayer = win.KalturaPlayer.getPlayers()['player-placeholder'];
          expect(recreatedPlayer.getService('dualScreen').getDualScreenPlayers('video').length, 'main and secondary video players').to.equal(2);
          expect(win.document.querySelectorAll(`[id="${PLACEHOLDER_ID}"]`).length, 'single placeholder').to.equal(1);
        });
      });
    });

    it('should load the secondary stream again when the previous destroy did not reach the dual-screen plugin', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      loadPlayer({layout: 'PIP'}).then(() => {
        cy.get('[data-testid="dualscreen_pipChildren"]').should('exist');
        cy.window().then(win => {
          // simulates a plugin that throws in destroy() before the dual-screen plugin is destroyed
          // @ts-ignore
          const mainPlayer = win.KalturaPlayer.getPlayers()['player-placeholder'];
          const dualScreenPlugin = mainPlayer.plugins.dualscreen;
          dualScreenPlugin.destroy = () => {};
          // @ts-ignore
          const staleSecondaryPlayer = win.KalturaPlayer.getPlayers()[PLACEHOLDER_ID];
          cy.spy(staleSecondaryPlayer, 'destroy').as('staleSecondaryPlayerDestroy');
          mainPlayer.destroy();
          expect(win.document.getElementById(PLACEHOLDER_ID), 'stale placeholder is left behind').to.exist;
          expect(staleSecondaryPlayer.destroy, 'stale secondary player is not destroyed yet').to.not.have.been.called;
        });

        cy.window().then(win => setupPlayer(win, {layout: 'PIP'}));
        cy.get('[data-testid="dualscreen_pipChildren"]').should('exist');
        cy.get('@staleSecondaryPlayerDestroy').should('have.been.calledOnce');
        cy.window().then(win => {
          // @ts-ignore
          const recreatedPlayer = win.KalturaPlayer.getPlayers()['player-placeholder'];
          expect(recreatedPlayer.getService('dualScreen').getDualScreenPlayers('video').length, 'main and secondary video players').to.equal(2);
          expect(win.document.querySelectorAll(`[id="${PLACEHOLDER_ID}"]`).length, 'single placeholder').to.equal(1);
        });
      });
    });

    it('should not create the secondary player when the secondary media response arrives after destroy', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      let secondaryMediaRequested = false;
      let releaseSecondaryMedia = () => {};
      const secondaryMediaReleased = new Promise<void>(resolve => {
        releaseSecondaryMedia = resolve;
      });
      // registered after mockKalturaBe so it takes precedence; holds the secondary media response until released
      cy.intercept('http://mock-api/service/multirequest', req => {
        if (req.body[2]?.filter?.parentEntryIdEqual) {
          secondaryMediaRequested = true;
          return secondaryMediaReleased.then(() => req.reply({fixture: 'dual-screen-1-media.json'}));
        }
      });
      cy.visit('index.html');
      let mainPlayer: any;
      const pendingRequests: Promise<unknown>[] = [];
      cy.window().then(win => {
        mainPlayer = createPlayer(win, {layout: 'PIP'});
        const doRequest = mainPlayer.provider.doRequest.bind(mainPlayer.provider);
        mainPlayer.provider.doRequest = (...args: any[]) => {
          const request = doRequest(...args);
          pendingRequests.push(request);
          return request;
        };
        return mainPlayer.loadMedia({entryId: '0_wifqaipd'});
      });
      cy.wrap(null).should(() => {
        expect(secondaryMediaRequested, 'secondary media requested').to.be.true;
      });
      cy.then(() => {
        mainPlayer.destroy();
        releaseSecondaryMedia();
        // the plugin attached its response handler to each request before this code did,
        // so once the requests settle the plugin has already handled the response
        return Promise.all(pendingRequests);
      });
      cy.window().then(win => {
        expect(win.document.getElementById(PLACEHOLDER_ID), 'no placeholder created after destroy').to.not.exist;
        // @ts-ignore
        expect(win.KalturaPlayer.getPlayers()[PLACEHOLDER_ID], 'no secondary player created after destroy').to.not.exist;
      });
    });

    it('should not destroy the secondary player of another main player that is still active', () => {
      mockKalturaBe('dual-screen-1-media.json', 'cue-points-empty.json');
      let secondaryMediaRequests = 0;
      // registered after mockKalturaBe so it sees the request first; it only counts and lets the mock reply
      cy.intercept('http://mock-api/service/multirequest', req => {
        if (req.body[2]?.filter?.parentEntryIdEqual) {
          secondaryMediaRequests++;
        }
      });
      loadPlayer({layout: 'PIP'}).then(firstMainPlayer => {
        cy.get('[data-testid="dualscreen_pipChildren"]').should('exist');
        let firstSecondaryPlayer: any;
        const pendingRequests: Promise<unknown>[] = [];
        cy.window().then(win => {
          // @ts-ignore
          firstSecondaryPlayer = win.KalturaPlayer.getPlayers()[PLACEHOLDER_ID];
          cy.spy(firstSecondaryPlayer, 'destroy').as('firstSecondaryPlayerDestroy');
          const secondTarget = win.document.createElement('div');
          secondTarget.setAttribute('id', 'second-player-placeholder');
          win.document.body.appendChild(secondTarget);
          const secondMainPlayer = createPlayer(win, {layout: 'PIP'}, {}, 'second-player-placeholder');
          const doRequest = secondMainPlayer.provider.doRequest.bind(secondMainPlayer.provider);
          secondMainPlayer.provider.doRequest = (...args: any[]) => {
            const request = doRequest(...args);
            pendingRequests.push(request);
            return request;
          };
          return secondMainPlayer.loadMedia({entryId: '0_wifqaipd'});
        });
        cy.wrap(null).should(() => {
          expect(secondaryMediaRequests, 'secondary media requested by both main players').to.equal(2);
        });
        cy.then(() => Promise.all(pendingRequests));
        cy.window().then(win => {
          expect(firstSecondaryPlayer.destroy, 'first secondary player is not destroyed').to.not.have.been.called;
          expect((win.document.getElementById(PLACEHOLDER_ID) as any).secondaryPlayer, 'first placeholder is kept').to.equal(firstSecondaryPlayer);
          expect(firstMainPlayer.getService('dualScreen').getDualScreenPlayers('video').length, 'first main and secondary video players').to.equal(2);
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
          cy.get('[data-testid="dualscreen_switchToSideBySide"]').click({force: true});
        });
      });
    });
  });
});
