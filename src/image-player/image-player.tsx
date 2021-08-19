import './image-player.scss';

interface ImageItem {
  id: string;
  url: string;
  loaded?: boolean;
}

export class ImagePlayer {
  private _images: Array<ImageItem> = [];
  private _imagePlayer: any;
  private _activeImage: ImageItem | null = null;
  private _setMode = () => {};
  constructor(setMode: () => void) {
    this._imagePlayer = this._createImagePlayer();
    this._setMode = setMode;
  }

  public addImage = (item: ImageItem) => {
    if (!this._images.length || (this._activeImage && this._images[this._images.length - 1].id === this._activeImage.id)) {
      // preload first or new image
      this._loadImage(item);
    }
    this._images.push(item);
  };

  public setActive = (activeId: string) => {
    this._images.find((item, index) => {
      if (activeId === item.id) {
        this._imagePlayer.style.backgroundImage = `url('${item.url}')`;
        if (!this._activeImage) {
          this._setMode();
        }
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

  private _loadImage = (item: ImageItem) => {
    const img = new Image();
    img.onload = () => {
      item.loaded = true;
    };
    img.src = item.url;
  };
}
