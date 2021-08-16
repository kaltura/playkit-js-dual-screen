interface ImageItem {
  id: string;
  url: string;
  loaded?: boolean;
  errored?: boolean;
  vertical?: boolean;
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
      // preload first or new image
      this._loadImage(item);
    }
    this._images.push(item);
  };

  public setActive = (activeId: string) => {
    this._images.find((item, index) => {
      if (activeId === item.id) {
        // TODO: change container orientation (item.vertical)
        // TODO: check if pre-loading failed (item.errored)
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
    imagePlayer.setAttribute('id', 'imagePlayer');
    imagePlayer.style.height = '100%';
    imagePlayer.style.width = '100%';
    imagePlayer.style.backgroundPosition = 'center';
    imagePlayer.style.backgroundRepeat = 'no-repeat';
    imagePlayer.style.backgroundSize = 'cover';
    return imagePlayer;
  };

  private _loadImage = (item: ImageItem) => {
    const img = new Image();
    img.onload = () => {
      item.loaded = true;
      if (img.width > img.height) {
        item.vertical = false;
      } else {
        item.vertical = true;
      }
    };
    img.onerror = () => {
      item.errored = true;
    };
    img.src = item.url;
  };
}
