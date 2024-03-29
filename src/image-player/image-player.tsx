import {PreviewThumbnail} from '../types';
import './image-player.scss';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

type OnActiveChange = (imageItem: SlideItem | null) => void;

export interface RawSlideItem {
  id: string;
  imageUrl: string;
  alt: string;
  startTime: number;
}

export interface SlideItem extends RawSlideItem {
  index: number;
  loading: boolean;
  loaded: boolean;
  portrait: boolean;
  height: number;
  width: number;
  ready: Promise<void>;
  setReady: () => void;
  retryAttempts: number;
}

export interface SlideThumbnail extends PreviewThumbnail {
  slide: true;
}

export class ImagePlayer {
  private _images: Array<SlideItem> = [];
  private _imagePlayer: HTMLDivElement;
  private _activeImage: SlideItem | null = null;
  private _onActiveChange: OnActiveChange;
  private _retryTimeout: any;
  private _preloadEnabled: boolean = true;

  constructor(onActiveChanged: OnActiveChange, preloadEnabled: boolean) {
    this._imagePlayer = this._createImagePlayer();
    this._onActiveChange = onActiveChanged;
    this._preloadEnabled = preloadEnabled;
  }

  get active() {
    return this._activeImage;
  }

  public getThumbnail = (time: number): SlideThumbnail | undefined => {
    for (let i = this._images.length - 1; i >= 0; i--) {
      if (this._images[i].startTime <= time) {
        return {
          height: this._images[i].height,
          width: this._images[i].width,
          x: 0,
          y: 0,
          url: this._images[i].imageUrl,
          slide: true
        };
      }
    }
  };

  public preLoadImages = () => {
    const isPreloadingActive = this._images.some(slide => slide.loading);
    if (!this._preloadEnabled || isPreloadingActive) {
      // preload feature disabled or preloading currently in progress
      return;
    }
    const startIndex = this._activeImage ? this._activeImage.index : 0;
    for (let i = startIndex; i < this._images.length; i++) {
      const preloadCandidate = this._images[i];
      if (!this._isSlideItemPreloded(preloadCandidate)) {
        this._preLoadImage(preloadCandidate);
        // preload candidate found, interrupt search
        return;
      }
    }
    // preloadCandidate haven't found, try find nextPreloadCandidate from beginnig of array
    const nextPreloadCandidate = this._images.find(slideItem => {
      return !this._isSlideItemPreloded(slideItem);
    });
    if (nextPreloadCandidate) {
      this._preLoadImage(nextPreloadCandidate);
    }
  };

  public addImage = (item: RawSlideItem) => {
    if (this._images.find(slideItem => slideItem.id === item.id)) {
      // prevent add duplications
      return;
    }
    let setReadyFn = () => {};
    const readyPromise = new Promise<void>(setReady => {
      setReadyFn = setReady;
    });
    const slideItem: SlideItem = {
      ...item,
      index: this._images.length,
      height: 0,
      width: 0,
      loading: false,
      loaded: false,
      portrait: false,
      retryAttempts: 0,
      ready: readyPromise,
      setReady: setReadyFn
    };
    this._images.push(slideItem);
  };

  public setActive = (activeId: string | null) => {
    if (!activeId) {
      if (!this._activeImage) {
        // prevent remove image if active is null
        return;
      }
      // remove active image
      const imageElement = this._imagePlayer.firstChild! as HTMLImageElement;
      imageElement.setAttribute('src', '');
      imageElement.removeAttribute('alt');
      this._activeImage = null;
      this._onActiveChange(null);
      return;
    }
    if (this._activeImage && activeId === this._activeImage.id) {
      // prevent set the same active image
      return;
    }
    clearTimeout(this._retryTimeout);
    this._images.find(item => {
      if (activeId === item.id) {
        this._preLoadImage(item);
        this._activeImage = item;
        item.ready.then(() => {
          // check that during loading active image haven't changed
          if (this._activeImage?.id === item.id) {
            this._onActiveChange(item);
            const imageElement = this._imagePlayer.firstChild! as HTMLImageElement;
            imageElement.setAttribute('src', item.imageUrl);
            imageElement.setAttribute('alt', item.alt || 'Slide');
          }
        });
        return true;
      }
      return false;
    });
  };

  public getVideoElement = () => {
    return this._imagePlayer;
  };

  private _isSlideItemPreloded = (item: SlideItem) => {
    return item.loaded || item.loading || item.retryAttempts >= MAX_RETRY_ATTEMPTS;
  };

  private _createImagePlayer = () => {
    const imagePlayer = document.createElement('div');
    const img = document.createElement('img');
    img.src = '';
    img.alt = '';
    imagePlayer.appendChild(img);
    imagePlayer.classList.add('playkit-image-player');
    imagePlayer.dataset.testid = 'dualscreen_imagePlayer';
    return imagePlayer;
  };

  private _preLoadImage = (item: SlideItem) => {
    if (this._isSlideItemPreloded(item)) {
      // current item already preloaded, try next
      this.preLoadImages();
      return;
    }
    item.retryAttempts++;
    item.loading = true;
    const img = new Image();
    img.onload = () => {
      item.loading = false;
      item.loaded = true;
      item.width = img.width;
      item.height = img.height;
      item.portrait = img.width < img.height;
      item.setReady();
      this.preLoadImages();
    };
    img.onerror = () => {
      item.loading = false;
      this._retryTimeout = setTimeout(() => {
        this._preLoadImage(item);
      }, RETRY_DELAY);
    };
    img.src = item.imageUrl;
  };

  public reset = () => {
    this._activeImage = null;
    this._images = [];
    clearTimeout(this._retryTimeout);
  };

  public destroy = () => {
    this.reset();
  };
}
