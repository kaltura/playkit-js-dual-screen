interface ImageItem {
  id: string;
  url: string;
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
    // TODO: check duplicates
    if (!this._images.length || (this._activeImage && this._images[this._images.length - 1].id === this._activeImage.id)) {
      // preload first slide
      this._loadImage(item.url);
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
        if (this._images[index + 1]) {
          // preload next image
          this._loadImage(this._images[index + 1].url);
        }
        return true;
      }
    });
  };

  public getVideoElement = () => {
    return this._imagePlayer;
  };

  private _createImagePlayer = () => {
    const imagePlayer = document.createElement('div');
    imagePlayer.setAttribute('id', 'imagePlayer');
    imagePlayer.style.height = '100%';
    imagePlayer.style.width = '100%';
    imagePlayer.style.backgroundPosition = 'center';
    imagePlayer.style.backgroundRepeat = 'no-repeat';
    imagePlayer.style.backgroundSize = 'cover';
    return imagePlayer;
  };

  private _loadImage = (src: string) => {
    const img = new Image();
    img.onload = function () {
      // TODO: on load
    };
    img.onerror = function () {
      // TODO: on error
    };
    img.src = src;
  };
}
