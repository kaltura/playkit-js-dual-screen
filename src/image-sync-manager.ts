// @ts-ignore
import {cuepoint} from 'kaltura-player-js';
import {ImagePlayer} from './image-player';

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
          partnerData: ViewChangeData;
        };
        key: string;
      };
    }>;
    label: string;
  };
}

export interface ViewChangeData {
  playerViewModeId?: string;
}

export class ImageSyncManager {
  _eventManager: KalturaPlayerTypes.EventManager;
  _mainPlayer: KalturaPlayerTypes.Player;
  _imagePlayer: ImagePlayer;
  _logger: KalturaPlayerTypes.Logger;
  _onSlideViewChanged: (viewChangeData: ViewChangeData) => void;
  _kalturaCuePointService: any;

  constructor(
    eventManager: KalturaPlayerTypes.EventManager,
    mainPlayer: KalturaPlayerTypes.Player,
    imagePlayer: ImagePlayer,
    logger: KalturaPlayerTypes.Logger,
    onSlideViewChanged: (viewChangeData: ViewChangeData) => void
  ) {
    this._eventManager = eventManager;
    this._mainPlayer = mainPlayer;
    this._imagePlayer = imagePlayer;
    this._logger = logger;
    this._onSlideViewChanged = onSlideViewChanged;
    this._syncEvents();
    this._kalturaCuePointService = this._mainPlayer.getService('kalturaCuepoints');
  }

  private _syncEvents = () => {
    this._eventManager.listen(this._mainPlayer, this._mainPlayer.Event.TIMED_METADATA, this._onTimedMetadata);
    this._eventManager.listen(this._mainPlayer, this._mainPlayer.Event.TIMED_METADATA_ADDED, this._onTimedMetadataAdded);
  };

  private _onTimedMetadata = ({payload}: TimedMetadata) => {
    if (payload.label === KalturaPlayer.cuepoint.CUE_POINTS_TEXT_TRACK) {
      const activeSlide = payload.cues?.find(cue => {
        return cue.value?.data?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.THUMB;
      });
      // TODO: consider set single layout from view-change cue-points
      this._imagePlayer.setActive(activeSlide ? activeSlide.value.data.id : null);

      const viewChange = payload.cues?.find(cue => {
        return cue.value?.data?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.CODE;
      });
      if (viewChange) {
        this._onSlideViewChanged(viewChange.value.data.partnerData);
      }
    }
  };

  private _onTimedMetadataAdded = ({payload}: TimedMetadata) => {
    payload.cues.forEach(cue => {
      if (cue?.value?.key === cuepoint.CUE_POINT_KEY && cue.value?.data?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.THUMB) {
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
