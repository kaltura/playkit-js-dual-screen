import {ImagePlayer} from './image-player';

export class ImageSyncManager {
  _eventManager: KalturaPlayerTypes.EventManager;
  _mainPlayer: KalturaPlayerTypes.Player;
  _imagePlayer: ImagePlayer;
  _logger: KalturaPlayerTypes.Logger;

  constructor(
    eventManager: KalturaPlayerTypes.EventManager,
    mainPlayer: KalturaPlayerTypes.Player,
    imagePlayer: ImagePlayer,
    logger: KalturaPlayerTypes.Logger,
  ) {
    this._eventManager = eventManager;
    this._mainPlayer = mainPlayer;
    this._imagePlayer = imagePlayer;
    this._logger = logger;
    this._syncEvents();
  }

  private _syncEvents = () => {
    this._eventManager.listen(this._mainPlayer, this._mainPlayer.Event.TIMED_METADATA, this._onTimedMetadata);
    this._eventManager.listen(this._mainPlayer, 'timed_metadata_added', this._onTimedMetadataAdded); // TODO: should be enum from cuePointManager
  };

  private _onTimedMetadata = ({payload}: {payload: {cues: Array<{track: {label: string; language: string}; value: {data: {id: string}}}>}}) => {
    if (payload.cues[0]?.track?.label === 'KalturaCuePoints' && payload.cues[0]?.track?.language === 'slides') {
      // TODO: 'slides' should be enum from cue-point plugin
      this._imagePlayer.setActive(payload.cues[0].value.data.id);
    }
  };

  private _onTimedMetadataAdded = ({payload}: {payload: {cues: Array<{value: {key: string; data: Record<string, string>}}>}}) => {
    payload.cues.forEach(cue => {
      if (cue?.value && cue?.value?.key === 'KalturaCuePoint')
        this._imagePlayer.addImage({
          id: cue.value.data.id,
          url: cue.value.data.url
        });
    });
  };
}
