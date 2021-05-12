const {EventType} = KalturaPlayer.core;

export class VideoSyncManager {
  private _mainPlayer: any = null;
  private _secondaryPlayer: any = null;
  private _eventManager: any = null;

  private _isSyncDelay = false;
  private _shouldSyncState = true;
  private _eventListeners = {};

  constructor(eventManager: any, mainPlayer: any, secondaryPlayer: any) {
    this._eventManager = eventManager;
    this._mainPlayer = mainPlayer;
    this._secondaryPlayer = secondaryPlayer;
    this._syncEvents();
  }

  private _syncEvents = () => {
    let lastSync = 0;
    const synchInterval = 1000;
    const bufferTimerId = null;
    this._eventManager.listen(this._mainPlayer, EventType.PLAY, () => {
      if (this._shouldSyncState) {
        this._secondaryPlayer!.play();
      }
    });
    this._eventManager.listen(this._mainPlayer, EventType.PAUSE, () => {
      if (this._shouldSyncState) {
        this._secondaryPlayer!.pause();
      }
    });

  };



  public destroy = () => {
    this._eventManager.destroy();
  };
}
