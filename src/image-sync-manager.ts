// @ts-ignore
import {cuepoint} from 'kaltura-player-js';
import {ImagePlayer} from './image-player';

interface TimedMetadata {
  payload: {
    cues: Array<Cue>;
    label: string;
  };
}

interface Cue extends VTTCue {
  value?: {
    data: {
      id: string;
      cuePointType: string;
      assetUrl: string;
      partnerData: ViewChangeData;
    };
    key: string;
  };
}

export interface ViewChangeData {
  playerViewModeId?: string;
  viewModeLockState?: string;
}

export class ImageSyncManager {
  _eventManager: KalturaPlayerTypes.EventManager;
  _mainPlayer: KalturaPlayerTypes.Player;
  _imagePlayer: ImagePlayer;
  _logger: KalturaPlayerTypes.Logger;
  _onSlideViewChanged: (viewChangeData: ViewChangeData, viewModeLockState: boolean) => void;
  _kalturaCuePointService: any;
  _previouslyHandledViewChanges: Map<string, VTTCue> = new Map();

  constructor(
    eventManager: KalturaPlayerTypes.EventManager,
    mainPlayer: KalturaPlayerTypes.Player,
    imagePlayer: ImagePlayer,
    logger: KalturaPlayerTypes.Logger,
    onSlideViewChanged: (viewChangeData: ViewChangeData, viewModeLockState: boolean) => void
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

  private _onTimedMetadata = () => {
    // TODO: use single "metadata" TextTrack once cue-point manager become use it
    const activeCuePoints: Array<Cue> = Array.from(this._mainPlayer.cuePointManager.getActiveCuePoints());
    const currHandledViewChanges: Map<string, VTTCue> = new Map();
    if (activeCuePoints.length) {
      const activeSlide = activeCuePoints.find(cue => {
        return cue.value?.data?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.THUMB;
      });
      // TODO: consider set single layout from view-change cue-points
      this._imagePlayer.setActive(activeSlide ? activeSlide.value!.data.id : null);
      if (activeSlide){
        const viewChanges = activeCuePoints.filter(cue => {
          return cue.value?.data?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.CODE;
        });
        const lock = viewChanges.find(viewChange => viewChange.value!.data?.partnerData?.viewModeLockState === 'locked');
        viewChanges.forEach(viewChange => {
          if (!this._previouslyHandledViewChanges.has(viewChange.id)) {
            this._onSlideViewChanged(viewChange.value!.data.partnerData, !!lock);
          }
          currHandledViewChanges.set(viewChange.id, viewChange);
        });
      }
    }
    this._previouslyHandledViewChanges = currHandledViewChanges;
  };

  private _onTimedMetadataAdded = ({payload}: TimedMetadata) => {
    payload.cues.forEach(cue => {
      if (cue?.value?.key === cuepoint.CUE_POINT_KEY && cue.value?.data?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.THUMB) {
        this._imagePlayer.addImage({
          id: cue?.value!.data.id,
          imageUrl: cue.value!.data.assetUrl,
          errored: false,
          portrait: false,
          loaded: false
        });
      }
    });
  };

  reset() {
    this._previouslyHandledViewChanges.clear();
  }
}
