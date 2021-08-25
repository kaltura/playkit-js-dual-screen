import {setup} from 'kaltura-player-js';
import * as TestUtils from './utils/test-utils';
import {TIMED_METADATA_ADDED, SLIDE_CUE_POINT_TYPE} from '../../src/image-sync-manager';
import {core} from 'kaltura-player-js';
const {EventType, FakeEvent, Cue} = core;

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

    it('should handle TIMED_METADATA event', done => {
      player.addEventListener(EventType.TIMED_METADATA, ({payload}) => {
        expect(payload.cues[0].track.label).to.eql('KalturaCuePoints');
        expect(payload.cues[0].track.language).to.eql(SLIDE_CUE_POINT_TYPE);
        expect(payload.cues[0].value.data.id).to.eql('test_id');
        expect(payload.cues[0].value.data.url).to.eql('test_url');
        expect(payload.cues[0].startTime).to.eql(1);
        expect(payload.cues[0].endTime).to.eql(5);
        done();
      });
      player.addEventListener(EventType.MEDIA_LOADED, () => {
        const slideTrack = player.getVideoElement().addTextTrack('metadata', 'KalturaCuePoints', SLIDE_CUE_POINT_TYPE);
        let cue;
        if (window.VTTCue) {
          cue = new VTTCue(1, 5, '');
        } else if (window.TextTrackCue) {
          cue = new Cue(1, 5, '');
        }
        cue.value = {key: 'KalturaCuePoint', type: SLIDE_CUE_POINT_TYPE, data: {id: 'test_id', url: 'test_url'}};
        slideTrack.addCue(cue);
      });
      player.play();
    });

    it('should handle TIMED_METADATA_ADDED event', done => {
      player.addEventListener(TIMED_METADATA_ADDED, ({payload}) => {
        expect(payload.cues[0].value.key).to.eql('KalturaCuePoint');
        expect(payload.cues[0].value.type).to.eql(SLIDE_CUE_POINT_TYPE);
        done();
      });
      player.addEventListener(EventType.MEDIA_LOADED, () => {
        player.dispatchEvent(new FakeEvent(TIMED_METADATA_ADDED, {cues: [{value: {key: 'KalturaCuePoint', type: SLIDE_CUE_POINT_TYPE}}]}));
      });
      player.play();
    });
  });
});
