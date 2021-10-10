import './image-player.scss';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

type OnActiveChange = (imageItem: SlideItem | null) => void;

export interface SlideItem {
  id: string;
  imageUrl: string;
  loaded: boolean;
  errored: boolean;
  portrait: boolean;
}

export class ImagePlayer {
  private _images: Array<SlideItem> = [];
  private _imagePlayer: HTMLDivElement;
  private _activeImage: SlideItem | null = null;
  private _onActiveChange: OnActiveChange;
  private _retryInterval: any;

  constructor(onActiveChanged: OnActiveChange) {
    this._imagePlayer = this._createImagePlayer();
    this._onActiveChange = onActiveChanged;
  }

  get active() {
    return this._activeImage;
  }

  public addImage = (item: SlideItem) => {
    if (!this._images.length || (this._activeImage && this._images[this._images.length - 1].id === this._activeImage.id)) {
      // preload first or new image
      this._loadImage(item);
    }
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
    clearTimeout(this._retryInterval);
    this._images.find((item, index) => {
      if (activeId === item.id) {
        this._onActiveChange(item);
        this._imagePlayer.style.backgroundImage = `url('${item.imageUrl}')`;
        this._activeImage = item;
        if (this._images[index + 1] && !this._images[index + 1].loaded) {
          // preload next image
          this._loadImage(this._images[index + 1]);
        }
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

  private _loadImage = (item: SlideItem, attempt = 0) => {
    const img = new Image();
    img.onload = () => {
      item.loaded = true;
      item.errored = false;
      item.portrait = img.width < img.height;
    };
    img.onerror = () => {
      item.errored = true;
      if (attempt < MAX_RETRY_ATTEMPTS) {
        this._retryInterval = setTimeout(() => {
          this._loadImage(item, attempt + 1);
        }, RETRY_DELAY);
      }
    };
    img.src = item.imageUrl;
  };

  public reset = () => {
    this._activeImage = null;
    this._images = [];
  };
}
