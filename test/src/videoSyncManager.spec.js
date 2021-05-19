import {setup} from 'kaltura-player-js';
import {EventManager} from '@playkit-js/playkit-js';
import * as TestUtils from './utils/test-utils';
import {VideoSyncManager} from '../../src/videoSyncManager';
import {core} from 'kaltura-player-js';
const {EventType} = core;

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
    it('should sync play & pause', done => {
      let eventManager = new EventManager();
      new VideoSyncManager(eventManager, playerMain, playerSecondary, {debug: noop});
      playerSecondary.addEventListener(EventType.PLAY, () => {
        playerSecondary.addEventListener(EventType.PAUSE, () => {
          done();
        });
        playerMain.pause();
      });
      playerMain.play();
    });
  });
});
