import {ImagePlayer} from '../../../src/image-player';
import * as TestUtils from '../utils/test-utils';

describe('KDualscreenPlugin', function () {
  const imageItem = {
    id: 'test_id',
    url: 'https://corp.kaltura.com/wp-content/themes/kaltura/img/logo-black-static.png',
    loaded: false,
    errored: false,
    portrait: false
  };
  describe('ImageSyncManager', () => {
    it('should test getVideoElement', done => {
      const imagePlayer = new ImagePlayer(TestUtils.noop);
      expect(imagePlayer.getVideoElement().getAttribute('class')).contain('playkit-image-player');
      done();
    });
    it('should test addImage', done => {
      const imagePlayer = new ImagePlayer(TestUtils.noop);
      imagePlayer.addImage(imageItem);
      expect(imagePlayer._images.length).to.eql(1);
      expect(imagePlayer._images[0]).to.eql(imageItem);
      done();
    });
    it('should test setActive', done => {
      const onActiveChaged = sinon.spy();
      const imagePlayer = new ImagePlayer(onActiveChaged);
      expect(imagePlayer._activeImage).to.eql(null);
      imagePlayer.addImage(imageItem);
      imagePlayer.setActive('test_id');
      expect(imagePlayer._activeImage).to.eql(imageItem);
      expect(onActiveChaged).to.have.been.calledWithExactly(imageItem);
      done();
    });
  });
});
