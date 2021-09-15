// @ts-ignore
import {cuepoint} from 'kaltura-player-js';
import {ImagePlayer} from './image-player';

export const ThumbCuePointType = 'thumbCuePoint.Thumb'; // TODO: use enum from cue-point service once it got deployed

interface TimedMetadata {
  payload: {
    cues: Array<{
      track: {
        label: string;
      };
      value: {
        data: {
          id: string;
          cuePointType: string;
          assetUrl: string;
        };
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
    this._eventManager.listen(this._mainPlayer, this._mainPlayer.Event.TIMED_METADATA_ADDED, this._onTimedMetadataAdded);
  };

  private _onTimedMetadata = ({payload}: TimedMetadata) => {
    const activeSlide = payload.cues?.find(cue => {
      return cue.track?.label === cuepoint.CUE_POINTS_TEXT_TRACK && cue.value?.data?.cuePointType === ThumbCuePointType;
    });
    this._imagePlayer.setActive(activeSlide ? activeSlide.value.data.id : null);
  };

  private _onTimedMetadataAdded = ({payload}: TimedMetadata) => {
    payload.cues.forEach(cue => {
      if (cue?.value?.key === cuepoint.CUE_POINT_KEY && cue.value?.data?.cuePointType === ThumbCuePointType) {
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
