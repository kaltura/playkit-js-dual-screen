import './image-player.scss';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

type OnActiveChange = (imageItem: SlideItem | null) => void;

export interface RawSlideItem {
  id: string;
  imageUrl: string;
}

export interface SlideItem extends RawSlideItem {
  loading: boolean;
  loaded: boolean;
  portrait: boolean;
  ready: Promise<void>;
  setReady: () => void;
  retryAttempts: number;
}

export class ImagePlayer {
  private _images: Array<SlideItem> = [];
  private _preloadIndex: number = -1;
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

  public preLoadImages = () => {
    if (
      !this._preloadEnabled ||
      !this._images.length ||
      this._preloadIndex === this._images.length - 1 || // No images or all images preloaded
      this._images[this._preloadIndex]?.loading // we are already in a pre load process
    )
      return;

    this._preloadIndex++;
    this._preLoadImage(this._images[this._preloadIndex], true);
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
      (this._imagePlayer.firstChild! as HTMLImageElement).setAttribute('src', '');
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
          this._onActiveChange(item);
          (this._imagePlayer.firstChild! as HTMLImageElement).setAttribute('src', item.imageUrl);
        });
        return true;
      }
      return false;
    });
  };

  public getVideoElement = () => {
    return this._imagePlayer;
  };

  private _createImagePlayer = () => {
    const imagePlayer = document.createElement('div');
    const img = document.createElement('img');
    img.src = '';
    imagePlayer.appendChild(img);
    imagePlayer.classList.add('playkit-image-player');
    return imagePlayer;
  };

  private _preLoadImage = (item: SlideItem, bunch = false) => {
    if (item.loading || item.loaded || item.retryAttempts >= MAX_RETRY_ATTEMPTS) {
      // skip preloading
      if (bunch) {
        // continue bunch preloading
        this.preLoadImages();
      }
      return;
    }
    item.retryAttempts++;
    item.loading = true;
    const img = new Image();
    img.onload = () => {
      item.loading = false;
      item.loaded = true;
      item.portrait = img.width < img.height;
      item.setReady();
      this.preLoadImages();
    };
    img.onerror = () => {
      item.loading = false;
      this._retryTimeout = setTimeout(() => {
        this._preLoadImage(item, bunch);
      }, RETRY_DELAY);
    };
    img.src = item.imageUrl;
  };

  public reset = () => {
    this._activeImage = null;
    this._images = [];
    this._preloadIndex = -1;
    clearTimeout(this._retryTimeout);
  };
}
