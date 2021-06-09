import {isInInterval} from './utils';
// @ts-ignore
import {core} from 'kaltura-player-js';
const {EventType, FakeEvent, Error, StateType} = core;

export class VideoSyncManager {
  private _isSyncDelay = false;

  _eventManager: KalturaPlayerTypes.EventManager;
  _mainPlayer: KalturaPlayerTypes.Player;
  _secondaryPlayer: KalturaPlayerTypes.Player;
  _logger: KalturaPlayerTypes.Logger;

  constructor(
    eventManager: KalturaPlayerTypes.EventManager,
    mainPlayer: KalturaPlayerTypes.Player,
    secondaryPlayer: KalturaPlayerTypes.Player,
    logger: KalturaPlayerTypes.Logger
  ) {
    this._eventManager = eventManager;
    this._mainPlayer = mainPlayer;
    this._secondaryPlayer = secondaryPlayer;
    this._logger = logger;
    this._syncEvents();
    this._errorHandling();
  }

  private _errorHandling = () => {
    this._eventManager.listen(this._secondaryPlayer, EventType.ERROR, (e: Error) => {
      this._logger.debug('errorHandling :: secondary player got error');
      const error = new Error(Error.Severity.CRITICAL, Error.Category.PLAYER, Error.Code.VIDEO_ERROR, e);
      this._mainPlayer.pause();
      this._mainPlayer.dispatchEvent(new FakeEvent(EventType.ERROR, error));
    });
    this._eventManager.listen(this._mainPlayer, EventType.ERROR, () => {
      this._logger.debug('errorHandling :: main player got error');
      this._secondaryPlayer.destroy();
    });
  };

  private _syncEvents = () => {
    let lastSync = 0;
    const synchInterval = 1000;
    this._eventManager.listen(this._mainPlayer, EventType.PLAY, () => {
      this._logger.debug('syncEvents :: secondary player play');
      this._secondaryPlayer.play();
    });
    this._eventManager.listen(this._mainPlayer, EventType.PAUSE, () => {
      this._logger.debug('syncEvents :: secondary player pause');
      this._secondaryPlayer.pause();
    });
    this._eventManager.listen(this._mainPlayer, EventType.TIME_UPDATE, () => {
      if (!this._isSyncDelay) {
        const now = Date.now();
        if (now - lastSync > synchInterval || this._mainPlayer.paused) {
          lastSync = now;
          this._mediaSync();
        }
      }
    });
    this._eventManager.listen(this._mainPlayer, EventType.SEEKING, () => {
      this._logger.debug(`syncEvents :: seeking main player to to ${this._mainPlayer}`);
      this._secondaryPlayer!.pause();
    });
    this._eventManager.listen(this._mainPlayer, EventType.SEEKED, () => {
      this._logger.debug(`syncEvents :: seeked main player to ${this._mainPlayer.currentTime}`);
      if (this._mainPlayer.paused) {
        this._secondaryPlayer.pause();
      } else {
        this._secondaryPlayer.play();
      }
    });
    this._eventManager.listen(this._mainPlayer, EventType.ENDED, () => {
      this._logger.debug('syncEvents :: secondary player pause + seek to 0.01');
      this._secondaryPlayer.pause();
      this._seekSecondaryPlayer(0.01);
    });

    this._eventManager.listen(
      this._mainPlayer,
      EventType.PLAYER_STATE_CHANGED,
      ({payload}: {payload: {newState: {type: typeof StateType}; oldState: {type: typeof StateType}}}) => {
        if (
          payload.newState.type === StateType.BUFFERING &&
          !(this._mainPlayer.seeking || this._mainPlayer.paused) &&
          !this._secondaryPlayer.paused
        ) {
          this._logger.debug('syncEvents :: main player got BUFFERING');
          this._secondaryPlayer.pause();
          return;
        }
        if (payload.newState.type === StateType.PLAYING && payload.oldState.type === StateType.BUFFERING && this._secondaryPlayer.paused) {
          this._logger.debug('syncEvents :: main player resume PLAYING');
          this._secondaryPlayer.play();
        }
      }
    );
  };

  private _mediaSync = () => {
    if (this._isSyncDelay || (this._mainPlayer.paused && !this._mainPlayer.seeking)) {
      return;
    }
    const synchDelayThresholdPositive = 0.03;
    const synchDelayThresholdNegative = -0.03;
    const maxGap = 4;
    const seekAhead = 0.25; // s

    if (this._secondaryPlayer) {
      let doSeek = false;
      let synchDelay = this._getSyncDelay();
      this._logger.debug(`mediaSync :: synchDelay is ${synchDelay}`);
      let playbackRateChange = 0;
      let adaptivePlaybackRate = Math.round(Math.abs(synchDelay) * 100) / 100;
      if (synchDelay > synchDelayThresholdPositive) {
        playbackRateChange = -1 * adaptivePlaybackRate;
      } else if (synchDelay < synchDelayThresholdNegative) {
        playbackRateChange = adaptivePlaybackRate;
      }
      if (playbackRateChange !== 0) {
        if (Math.abs(synchDelay) < maxGap) {
          this._logger.debug(`mediaSync :: Adjusting slave playbackRateChange = ${this._mainPlayer.playbackRate + playbackRateChange}`);
          // set a slower playback rate for the video to let the master video catch up
          this._secondaryPlayer.playbackRate = this._mainPlayer.playbackRate + playbackRateChange;
        } else {
          this._logger.debug('mediaSync :: Adjusting secondary player playbackRateChange to main player and flagging for seek');
          // set playback rate back to normal
          this._secondaryPlayer.playbackRate = this._mainPlayer.playbackRate;
          // mark for seeking
          doSeek = true;
        }
      }
      // everything is fine
      else if (!this._mainPlayer.paused) {
        this._logger.debug('mediaSync :: Main player and secondary player sync, adjusting secondary player playback rate to main player rate');
        // set playback rate back to normal
        this._secondaryPlayer.playbackRate = this._mainPlayer.playbackRate;
        // play the video
        this._secondaryPlayer.play();
      }

      // if marked for seeking
      if (doSeek) {
        this._logger.debug(`mediaSync :: Seeking secondary player to ${this._mainPlayer.currentTime + seekAhead}`);
        this._seekSecondaryPlayer(seekAhead);
      }
    }
  };

  private _getSyncDelay = () => {
    const ctMaster = this._mainPlayer.currentTime; // current time in seconds
    const ct = this._secondaryPlayer.currentTime; // current time in seconds
    const syncGap = 0; // s
    if (ctMaster != -1 && ct != -1 && !isInInterval(ct, ctMaster - syncGap, ctMaster)) {
      return ct - ctMaster; // time difference
    }
    return 0; // delay is acceptable
  };

  private _seekSecondaryPlayer = (aheadTime: number) => {
    const seekTime = this._mainPlayer.currentTime < 0 ? 0 : this._mainPlayer.currentTime;
    if (this._secondaryPlayer.ended && this._secondaryPlayer.duration && Math.ceil(seekTime) > this._secondaryPlayer.duration) {
      // trying to seek out of bounds after secondary Player already ended
      // pause secondary Player
      this._logger.debug(`seekSecondaryPlayer :: seekTime ${seekTime} is out of bounds 0..${this._secondaryPlayer.duration}. pause secondary player`);
      this._secondaryPlayer.pause();
      return;
    }
    this._logger.debug(`seekSecondaryPlayer :: seeking to=${seekTime}, ahead=${aheadTime}`);
    this._secondaryPlayer.currentTime = seekTime + aheadTime;
    if (this._mainPlayer.paused) {
      this._secondaryPlayer.pause();
    } else {
      this._secondaryPlayer.play();
    }
  };

  public destroy = () => {
    // TODO: destroy
  };
}
