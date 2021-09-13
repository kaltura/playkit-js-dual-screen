import {ImagePlayer} from './image-player';

const ThumbCuePointType = 'thumbCuePoint.Thumb'; // TODO: use enum from cue-point service once it got deployed

interface TimedMetadata {
  payload: {
    cues: Array<{
      track: {
        label: string;
      };
      value: {
        data: Record<string, any>;
        key: string;
      };
    }>;
  };
}

export class ImageSyncManager {
  _eventManager: KalturaPlayerTypes.EventManager;
  _mainPlayer: KalturaPlayerTypes.Player;
  _imagePlayer: ImagePlayer;
  _logger: KalturaPlayerTypes.Logger;

  constructor(
    eventManager: KalturaPlayerTypes.EventManager,
    mainPlayer: KalturaPlayerTypes.Player,
    imagePlayer: ImagePlayer,
    logger: KalturaPlayerTypes.Logger
  ) {
    this._eventManager = eventManager;
    this._mainPlayer = mainPlayer;
    this._imagePlayer = imagePlayer;
    this._logger = logger;
    this._syncEvents();
  }

  private _syncEvents = () => {
    this._eventManager.listen(this._mainPlayer, this._mainPlayer.Event.TIMED_METADATA, this._onTimedMetadata);
    this._eventManager.listen(this._mainPlayer, this._mainPlayer.cuePointManager.TIMED_METADATA_ADDED, this._onTimedMetadataAdded);
  };

  private _onTimedMetadata = ({payload}: TimedMetadata) => {
    if (
      payload.cues[0]?.track?.label === this._mainPlayer.cuePointManager.CuePointsTextTrack &&
      payload.cues[0]?.value?.data?.cuePointType === ThumbCuePointType
    ) {
      this._imagePlayer.setActive(payload.cues[0].value.data.id);
    }
  };

  private _onTimedMetadataAdded = ({payload}: TimedMetadata) => {
    payload.cues.forEach(cue => {
      if (cue?.value?.key === this._mainPlayer.cuePointManager.CuePointKey && cue.value?.data?.cuePointType === ThumbCuePointType) {
        this._imagePlayer.addImage({
          id: cue.value.data.id,
          imageUrl: cue.value.data.assetUrl,
          errored: false,
          portrait: false,
          loaded: false
        });
      }
    });
  };
}
