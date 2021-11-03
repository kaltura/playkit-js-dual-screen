import './image-player.scss';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

type OnActiveChange = (imageItem: SlideItem | null) => void;

export interface SlideItem {
  id: string;
  imageUrl: string;
  loading: boolean;
  loaded: boolean;
  portrait: boolean;
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
    this._preLoadImage(this._images[this._preloadIndex]);
  };

  public addImage = (item: SlideItem) => {
    this._images.push(item);
  };

  public setActive = (activeId: string | null) => {
    if (!activeId) {
      if (!this._activeImage) {
        // prevent remove image if active is null
        return;
      }
      // remove active image
      this._imagePlayer.style.backgroundImage = 'none';
      this._activeImage = null;
      this._onActiveChange(null);
      return;
    }
    if (this._activeImage && activeId === this._activeImage.id) {
      // prevent set the same active image
      return;
    }
    clearTimeout(this._retryTimeout);
    this._images.find((item, index) => {
      if (activeId === item.id) {
        this._activeImage = item;
        this._onActiveChange(item);
        this._imagePlayer.style.backgroundImage = `url('${item.imageUrl}')`;
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
    imagePlayer.classList.add('playkit-image-player');
    return imagePlayer;
  };

  private _preLoadImage = (item: SlideItem, attempt = 0) => {
    item.loading = true;
    const img = new Image();
    img.onload = () => {
      item.loading = false;
      item.loaded = true;
      item.portrait = img.width < img.height;
      this.preLoadImages();
    };
    img.onerror = () => {
      if (attempt < MAX_RETRY_ATTEMPTS) {
        this._retryTimeout = setTimeout(() => {
          this._preLoadImage(item, attempt + 1);
        }, RETRY_DELAY);
      } else {
        item.loading = false;
        this.preLoadImages();
      }
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
