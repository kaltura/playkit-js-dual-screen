import './image-player.scss';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

export interface ImageItem {
  id: string;
  url: string;
  loaded?: boolean;
  errored?: boolean;
  portrait?: boolean;
}

export class ImagePlayer {
  private _images: Array<ImageItem> = [];
  private _imagePlayer: HTMLDivElement;
  private _activeImage: ImageItem | null = null;
  private _onActiveChange: (imageItem: ImageItem) => void;
  private _retryInterval: any;

  constructor(onActiveChanged: (imageItem: ImageItem) => void) {
    this._imagePlayer = this._createImagePlayer();
    this._onActiveChange = onActiveChanged;
  }

  public addImage = (item: ImageItem) => {
    if (!this._images.length || (this._activeImage && this._images[this._images.length - 1].id === this._activeImage.id)) {
      // preload first or new image
      this._loadImage(item);
    }
    this._images.push(item);
  };

  public setActive = (activeId: string) => {
    clearTimeout(this._retryInterval);
    this._images.find((item, index) => {
      if (activeId === item.id) {
        this._onActiveChange(item);
        this._imagePlayer.style.backgroundImage = `url('${item.url}')`;
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

  private _loadImage = (item: ImageItem, attempt = 0) => {
    const img = new Image();
    img.onload = () => {
      item.loaded = true;
      if (img.width > img.height) {
        item.portrait = false;
      } else {
        item.portrait = true;
      }
    };
    img.onerror = () => {
      item.errored = true;
      if (attempt < MAX_RETRY_ATTEMPTS) {
        this._retryInterval = setTimeout(() => {
          this._loadImage(item, attempt + 1);
        }, RETRY_DELAY);
      }
    };
    img.src = item.url;
  };
}
