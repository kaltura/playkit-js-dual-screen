import {ImagePlayer} from '../../../src/image-player';
import * as TestUtils from '../utils/test-utils';

describe('KDualscreenPlugin', function () {
  const imageItem = {
    id: 'test_id',
    imageUrl: 'https://corp.kaltura.com/wp-content/themes/kaltura/img/logo-black-static.png',
    loading: false,
    loaded: false,
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
  describe('Image player preload', () => {
    let imageItemInstance1;
    let imageItemInstance2;
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      imageItemInstance1 = {
        id: 'test_id',
        imageUrl: 'https://corp.kaltura.com/wp-content/themes/kaltura/img/logo-black-static.png',
        loading: false,
        loaded: false,
        portrait: false
      };
      imageItemInstance2 = {
        id: 'test_id',
        imageUrl: 'secondUrl',
        loading: false,
        loaded: false,
        portrait: false
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should try and preload when preload is switched on', done => {
      const imagePlayer = new ImagePlayer(TestUtils.noop, true);
      imagePlayer.addImage(imageItemInstance1);
      imagePlayer.preLoadImages();
      expect(imagePlayer._images[0].loading).to.eql(true);
      done();
    });

    it('should try and preload when preload is switched off', done => {
      const imagePlayer = new ImagePlayer(TestUtils.noop, false);
      imagePlayer.addImage(imageItemInstance1);
      imagePlayer.preLoadImages();
      expect(imagePlayer._images[0].loading).to.eql(false);
      done();
    });

    it('should try and preload an empty image array', done => {
      const imagePlayer = new ImagePlayer(TestUtils.noop, false);
      imagePlayer.preLoadImages();
      expect(imagePlayer._preloadIndex).to.eql(-1);
      done();
    });

    it('should try and preload an two images', done => {
      sandbox.stub(Image.prototype, "src").set(url=> {
        setTimeout(()=>{
          this.onloadCallback();
          if (imageItemInstance1.loaded && imageItemInstance2.loaded){
            done();
          }
        } ,10);

      });
      sandbox.stub(Image.prototype, "onload").set(fn => {
        this.onloadCallback = fn;
      });
      const imagePlayer = new ImagePlayer(TestUtils.noop, true);
      imagePlayer.addImage(imageItemInstance1);
      imagePlayer.addImage(imageItemInstance2);
      imagePlayer.preLoadImages();
    });

    it('should try and preload an two images, but fail on the first image', done => {
      sandbox.stub(Image.prototype, "src").set(url=> {
        if (url === imageItemInstance1.imageUrl){
          setTimeout(()=>{
            this.onerrorCallback();
          } ,10);
        }
        else{
          setTimeout(()=>{
            this.onloadCallback();
            if (!imageItemInstance1.loaded && imageItemInstance2.loaded){
              done();
            }
          } ,10);
        }


      });
      sandbox.stub(Image.prototype, "onload").set(fn => {
        this.onloadCallback = fn;
      });

      sandbox.stub(Image.prototype, "onerror").set(fn => {
        this.onerrorCallback = fn;
      });
      const imagePlayer = new ImagePlayer(TestUtils.noop, true);
      imagePlayer.addImage(imageItemInstance1);
      imagePlayer.addImage(imageItemInstance2);
      imagePlayer.preLoadImages();
    });
  });
});
