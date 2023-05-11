// @ts-ignore
import {core, PlaykitUI, Logger, KalturaPlayer} from '@playkit-js/kaltura-player-js';
import {ExternalLayout, ViewModeLockState} from './enums';
import {ImagePlayer} from './image-player';
import {debounce} from '@playkit-js/common/dist/utils-common/utils';

const {TimedMetadata, EventType} = core;

interface TimedMetadataEvent {
  payload: {
    cues: Array<typeof TimedMetadata>;
  };
}

export interface ViewChangeData {
  playerViewModeId?: ExternalLayout;
  viewModeLockState?: string;
}

const DEBOUNCE_TIMEOUT = 200;

export class ImageSyncManager {
  _eventManager: PlaykitUI.EventManager;
  _mainPlayer: KalturaPlayer;
  _imagePlayer: ImagePlayer;
  _logger: Logger;
  _onSlideViewChanged: (viewChangeData: ExternalLayout) => void;
  _kalturaCuePointService: any;
  _firstPlaying: boolean = false;
  _lock: boolean = false;
  private _debouncedSetActive: (slideId: string | null) => void;

  constructor(
    eventManager: PlaykitUI.EventManager,
    mainPlayer: KalturaPlayer,
    imagePlayer: ImagePlayer,
    logger: Logger,
    onSlideViewChanged: (viewChangeData: ExternalLayout) => void
  ) {
    this._eventManager = eventManager;
    this._mainPlayer = mainPlayer;
    this._imagePlayer = imagePlayer;
    this._logger = logger;
    this._onSlideViewChanged = onSlideViewChanged;
    this._syncEvents();
    this._kalturaCuePointService = this._mainPlayer.getService('kalturaCuepoints');
    this._debouncedSetActive = debounce(this._imagePlayer.setActive, DEBOUNCE_TIMEOUT);
  }

  private _syncEvents = () => {
    this._eventManager.listen(this._mainPlayer, EventType.TIMED_METADATA_CHANGE, this._onTimedMetadataChange);
    this._eventManager.listen(this._mainPlayer, EventType.TIMED_METADATA_ADDED, this._onTimedMetadataAdded);
    this._eventManager.listen(this._mainPlayer, EventType.FIRST_PLAYING, this._onFirstPlaying);
  };

  private _onFirstPlaying = () => {
    this._firstPlaying = true;
    this._imagePlayer.preLoadImages();
  };

  private _onTimedMetadataChange = ({payload}: TimedMetadataEvent) => {
    const {cues: activeCuePoints} = payload;
    const {activeSlide, externalLayout} = activeCuePoints.reduce<{activeSlide: string | null; externalLayout: ExternalLayout | null}>(
      (acc, cue) => {
        if (this._isSlideCuePoint(cue)) {
          return {...acc, activeSlide: cue.id};
        }
        if (cue.metadata?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.CODE && cue.metadata?.tags === 'change-view-mode') {
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
    this._debouncedSetActive(externalLayout === ExternalLayout.Hidden ? null : activeSlide);
  };

  private _onTimedMetadataAdded = ({payload}: TimedMetadataEvent) => {
    const slides = payload.cues.map(cue => {
      if (this._isSlideCuePoint(cue)) {
        this._imagePlayer.addImage({
          id: cue.id,
          imageUrl: cue.metadata!.assetUrl,
          alt: cue.metadata!.title || cue.metadata!.description
        });
        return cue;
      }
    });

    if (slides.length && this._firstPlaying) {
      this._imagePlayer.preLoadImages();
    }
  };

  private _isSlideCuePoint(cue: any) {
    return (
      cue?.type === TimedMetadata.TYPE.CUE_POINT &&
      cue.metadata?.cuePointType === this._kalturaCuePointService.KalturaCuePointType.THUMB &&
      cue.metadata?.subType === this._kalturaCuePointService.KalturaThumbCuePointSubType.SLIDE
    );
  }

  reset() {
    this._firstPlaying = false;
  }
}
