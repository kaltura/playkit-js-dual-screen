interface ImageItem {
  id: string;
  text: string;
}

export class ImagePlayer {
  private _images: Array<ImageItem> = [];
  private _imagePlayer: any;
  private _active = false;
  private _setMode = () => {};
  constructor(setMode: () => void) {
    this._imagePlayer = this._createImagePlayer();
    this._setMode = setMode;
  }

  public addImages = (items: ImageItem[]) => {
    // TODO: check duplicates
    this._images = [...this._images, ...items];
    // TODO: load only next image
    items.forEach(item => {
      this._loadImage(item.text);
    });
  };

  public setActive = (activeId: string) => {
    const activeItem = this._images.find(({id}) => activeId === id);
    if (activeItem) {
      this._imagePlayer.style.backgroundImage = `url('${activeItem.text}')`;
      if (!this._active) {
        this._setMode();
        this._active = true;
      }
    }
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
