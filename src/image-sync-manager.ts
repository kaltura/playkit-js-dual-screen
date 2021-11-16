// @ts-ignore
import {cuepoint} from 'kaltura-player-js';
import {StreamLayout, ViewModeLockState} from './enums';
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
  _onSlideViewChanged: (viewChangeData: StreamLayout) => void;
  _kalturaCuePointService: any;
  _firstPlaying: boolean = false;
  _lock: boolean = false;

  constructor(
    eventManager: KalturaPlayerTypes.EventManager,
    mainPlayer: KalturaPlayerTypes.Player,
    imagePlayer: ImagePlayer,
    logger: KalturaPlayerTypes.Logger,
    onSlideViewChanged: (viewChangeData: StreamLayout) => void
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
    this._eventManager.listen(this._mainPlayer, this._mainPlayer.Event.FIRST_PLAYING, this._onFirstPlaying);
  };

  private _onFirstPlaying = () => {
    this._firstPlaying = true;
    this._imagePlayer.preLoadImages();
  };

  private _onTimedMetadata = () => {
    // TODO: use single "metadata" TextTrack once cue-point manager become use it
    const activeCuePoints: Array<Cue> = Array.from(this._mainPlayer.cuePointManager.getActiveCuePoints());
    const {activeSlide, streamLayout} = activeCuePoints.reduce<{activeSlide: string | null; streamLayout: StreamLayout | null}>(
      (acc, cue) => {
        if (cue.value?.data?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.THUMB) {
          return {...acc, activeSlide: cue.value!.data.id};
        }
        if (cue.value?.data?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.CODE) {
          const {playerViewModeId, viewModeLockState} = cue.value!.data.partnerData;
          return {...acc, streamLayout: viewModeLockState === ViewModeLockState.Locked ? StreamLayout.Hidden : (playerViewModeId as StreamLayout)};
        }
        return acc;
      },
      {
        activeSlide: null,
        streamLayout: null
      }
    );

    if (streamLayout) {
      this._onSlideViewChanged(streamLayout);
    }
    if (streamLayout !== StreamLayout.Hidden) {
      this._imagePlayer.setActive(activeSlide);
    }
  };

  private _onTimedMetadataAdded = ({payload}: TimedMetadata) => {
    const slides = payload.cues.map(cue => {
      if (cue?.value?.key === cuepoint.CUE_POINT_KEY && cue.value?.data?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.THUMB) {
        this._imagePlayer.addImage({
          id: cue?.value!.data.id,
          imageUrl: cue.value!.data.assetUrl,
          portrait: false,
          loading: false,
          loaded: false
        });
        return cue;
      }
    });

    if (slides.length && this._firstPlaying) {
      this._imagePlayer.preLoadImages();
    }
  };

  reset() {
    this._firstPlaying = false;
  }
}
