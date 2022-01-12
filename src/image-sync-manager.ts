// @ts-ignore
import {cuepoint, core} from 'kaltura-player-js';
import {ExternalLayout, ViewModeLockState} from './enums';
import {ImagePlayer} from './image-player';

const {TimedMetadata} = core;

interface TimedMetadataEvent {
  payload: {
    cues: Array<typeof TimedMetadata>;
  };
}

export interface ViewChangeData {
  playerViewModeId?: ExternalLayout;
  viewModeLockState?: string;
}

export class ImageSyncManager {
  _eventManager: KalturaPlayerTypes.EventManager;
  _mainPlayer: KalturaPlayerTypes.Player;
  _imagePlayer: ImagePlayer;
  _logger: KalturaPlayerTypes.Logger;
  _onSlideViewChanged: (viewChangeData: ExternalLayout) => void;
  _kalturaCuePointService: any;
  _firstPlaying: boolean = false;
  _lock: boolean = false;

  constructor(
    eventManager: KalturaPlayerTypes.EventManager,
    mainPlayer: KalturaPlayerTypes.Player,
    imagePlayer: ImagePlayer,
    logger: KalturaPlayerTypes.Logger,
    onSlideViewChanged: (viewChangeData: ExternalLayout) => void
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
    this._eventManager.listen(this._mainPlayer, this._mainPlayer.Event.TIMED_METADATA_CHANGE, this._onTimedMetadataChange);
    this._eventManager.listen(this._mainPlayer, this._mainPlayer.Event.TIMED_METADATA_ADDED, this._onTimedMetadataAdded);
    this._eventManager.listen(this._mainPlayer, this._mainPlayer.Event.FIRST_PLAYING, this._onFirstPlaying);
  };

  private _onFirstPlaying = () => {
    this._firstPlaying = true;
    this._imagePlayer.preLoadImages();
  };

  private _onTimedMetadataChange = ({payload}: TimedMetadataEvent) => {
    const {cues: activeCuePoints} = payload;
    const {activeSlide, externalLayout} = activeCuePoints.reduce<{activeSlide: string | null; externalLayout: ExternalLayout | null}>(
      (acc, cue) => {
        if (cue.metadata?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.THUMB) {
          return {...acc, activeSlide: cue.id};
        }
        if (cue.metadata?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.CODE) {
          const {playerViewModeId, viewModeLockState} = cue.metadata!.partnerData;
          if (playerViewModeId) {
            return {...acc, externalLayout: viewModeLockState === ViewModeLockState.Locked ? ExternalLayout.Hidden : playerViewModeId};
          }
        }
        return acc;
      },
      {
        activeSlide: null,
        externalLayout: null
      }
    );

    if (externalLayout) {
      this._onSlideViewChanged(externalLayout);
    }
    if (externalLayout !== ExternalLayout.Hidden) {
      this._imagePlayer.setActive(activeSlide);
    }
  };

  private _onTimedMetadataAdded = ({payload}: TimedMetadataEvent) => {
    const slides = payload.cues.map(cue => {
      if (cue?.type === TimedMetadata.TYPE.CUE_POINT && cue.metadata?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.THUMB) {
        this._imagePlayer.addImage({
          id: cue?.id,
          imageUrl: cue.metadata!.assetUrl,
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
