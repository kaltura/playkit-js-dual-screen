import {setup} from 'kaltura-player-js';
import {EventManager} from '@playkit-js/playkit-js';
import * as TestUtils from './utils/test-utils';
import {VideoSyncManager} from '../../src/videoSyncManager';
import {core} from 'kaltura-player-js';
const {EventType, FakeEvent, Error, StateType} = core;

describe('KDualscreenPlugin', function () {
  let playerMain, playerSecondary, sandbox;
  const targets = ['playerMain-placeholder_dualscreen.spec', 'playerSecondary-placeholder_dualscreen.spec'];
  const config = {
    provider: {},
    id: '1_rwbj3j0a',
    session: {
      partnerID: 1068292,
      ks:
        'NTAwZjViZWZjY2NjNTRkNGEyMjU1MTg4OGE1NmUwNDljZWJkMzk1MXwxMDY4MjkyOzEwNjgyOTI7MTQ5MDE3NjE0NjswOzE0OTAwODk3NDYuMDIyNjswO3ZpZXc6Kix3aWRnZXQ6MTs7',
      uiConfID: 123456
    },
    sources: {
      progressive: [
        {
          mimetype: 'video/mp4',
          url: 'https://www.w3schools.com/tags/movie.mp4',
          id: '1_rwbj3j0a_11311,applehttp'
        }
      ]
    },
    plugins: {}
  };
  const noop = () => {};

  before(() => {
    targets.forEach(target => {
      TestUtils.createElement('DIV', target);
      const el = document.getElementById(target);
      el.style.height = '360px';
      el.style.width = '640px';
    });
  });

  afterEach(() => {
    sandbox.restore();
    [playerMain, playerSecondary].forEach(player => {
      player.destroy();
      player = null;
    });
    TestUtils.removeVideoElementsFromTestPage();
  });

  after(() => {
    targets.forEach(target => {
      TestUtils.removeElement(target);
    });
  });

  describe('VideoSyncManager', () => {
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      [playerMain, playerSecondary] = targets.map(target => {
        return setup({...config, targetId: target});
      });
    });

    it('should sync play & pause events', done => {
      new VideoSyncManager(new EventManager(), playerMain, playerSecondary, {debug: noop});
      playerSecondary.addEventListener(EventType.PLAY, () => {
        playerSecondary.addEventListener(EventType.PAUSE, () => {
          done();
        });
        playerMain.pause();
      });
      playerMain.play();
    });

    it('should sync seek event', done => {
      new VideoSyncManager(new EventManager(), playerMain, playerSecondary, {debug: noop});
      playerMain.addEventListener(EventType.PLAY, () => {
        playerSecondary.addEventListener(EventType.SEEKED, () => {
          done();
        });
        playerMain.currentTime = 5;
      });
      playerMain.play();
    });

    it('should sync ended event', done => {
      new VideoSyncManager(new EventManager(), playerMain, playerSecondary, {debug: noop});
      playerMain.addEventListener(EventType.ENDED, () => {
        try {
          expect(playerSecondary.paused).to.be.true;
          done();
        } catch (e) {
          done(e);
        }
      });
      playerSecondary.addEventListener(EventType.PLAYING, () => {
        playerMain.dispatchEvent(new FakeEvent(EventType.ENDED));
      });
      playerMain.play();
    });

    it('should handle error', done => {
      new VideoSyncManager(new EventManager(), playerMain, playerSecondary, {debug: noop});
      playerMain.addEventListener(EventType.ERROR, () => {
        done();
      });
      playerMain.addEventListener(EventType.PLAYING, () => {
        playerSecondary.dispatchEvent(
          new FakeEvent(EventType.ERROR, new Error(Error.Severity.CRITICAL, Error.Category.PLAYER, Error.Code.VIDEO_ERROR, {message: 'fake error'}))
        );
      });
      playerMain.play();
    });

    it('should handle buffering', done => {
      new VideoSyncManager(new EventManager(), playerMain, playerSecondary, {debug: noop});
      playerMain.addEventListener(EventType.PLAYER_STATE_CHANGED, ({payload}) => {
        if (payload.newState.type === StateType.BUFFERING) {
          playerSecondary.addEventListener(EventType.PAUSE, () => {
            playerMain.addEventListener(EventType.PLAYER_STATE_CHANGED, ({payload}) => {
              if (payload.newState.type === StateType.PLAYING && payload.oldState.type === StateType.BUFFERING) {
                playerSecondary.addEventListener(EventType.PLAY, () => {
                  done();
                });
              }
            });
          });
        }
      });
      playerSecondary.addEventListener(EventType.PLAYING, () => {
        playerMain.currentTime = 5;
      });
      playerMain.play();
    });
  });
});