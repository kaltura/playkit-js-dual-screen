import {setup} from 'kaltura-player-js';
import * as TestUtils from './utils/test-utils';
import {core, cuepoint} from 'kaltura-player-js';
const {EventType} = core;

describe('KDualscreenPlugin', function () {
  let player, sandbox;
  const target = 'player-placeholder_dualscreen.spec';

  before(() => {
    TestUtils.createElement('DIV', target);
    const el = document.getElementById(target);
    el.style.height = '360px';
    el.style.width = '640px';
  });

  afterEach(() => {
    sandbox.restore();
    player.destroy();
    player = null;
    TestUtils.removeVideoElementsFromTestPage();
  });

  after(() => {
    TestUtils.removeElement(target);
  });

  describe('ImageSyncManager', () => {
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      player = setup({
        targetId: target,
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
      });
    });

    const kalturaCuePoint = {
      id: 'test_id',
      assetUrl: 'test_url',
      cuePointType: 'thumbCuePoint.Thumb',
      startTime: 1,
      endTime: 5
    };

    it('should handle TIMED_METADATA_ADDED event', done => {
      player.addEventListener(EventType.TIMED_METADATA_ADDED, ({payload}) => {
        expect(payload.cues[0].value.key).to.eql(cuepoint.CUE_POINT_KEY);
        expect(payload.cues[0].value.data.cuePointType).to.eql("thumbCuePoint.Thumb");
        done();
      });
      player.addEventListener(EventType.MEDIA_LOADED, () => {
        player.cuePointManager.addCuePoints([kalturaCuePoint]);   
      });
      player.play();
    });

    it('should handle TIMED_METADATA event', done => {
      player.addEventListener(EventType.TIMED_METADATA, ({payload}) => {
        expect(payload.cues[0].track.label).to.eql(cuepoint.CUE_POINTS_TEXT_TRACK);
        expect(payload.cues[0].value.data.id).to.eql('test_id');
        expect(payload.cues[0].value.data.assetUrl).to.eql('test_url');
        expect(payload.cues[0].startTime).to.eql(1);
        expect(payload.cues[0].endTime).to.eql(5);
        done();
      });
      player.addEventListener(EventType.MEDIA_LOADED, () => {
        player.cuePointManager.addCuePoints([kalturaCuePoint]);
      });
      player.play();
    });
  });
});
