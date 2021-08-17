import {DualScreenConfig} from './types/DualScreenConfig';
import {h} from 'preact';
import {PipChild, PipParent} from './components/pip';
import {PipMinimized} from './components/pip-minimized';
import {Position, Animations, Layout, ReservedPresetAreas, PlayerType} from './enums';
import {VideoSyncManager} from './videoSyncManager';
import {ResponsiveManager} from './components/responsive-manager';
import {SecondaryMediaLoader} from './providers/secondary-media-loader';
import {DragAndSnapManager} from './components/drag-and-snap-manager';
import {SideBySideWrapper} from './components/side-by-side/side-by-side-wrapper';
import {setSubtitlesOnTop} from './utils';
import {DualScreenEngineDecorator} from './dualscreen-engine-decorator';
import {ImagePlayer} from './image-player';
// @ts-ignore
import {core} from 'kaltura-player-js';
const {EventType, Cue} = core;

const PRESETS = ['Playback', 'Live', 'Ads'];
// @ts-ignore
export class DualScreen extends KalturaPlayer.core.BasePlugin implements IEngineDecoratorProvider {
  public secondaryKalturaPlayer: KalturaPlayerTypes.Player;
  private _player: KalturaPlayerTypes.Player;
  private _layout: Layout = Layout.PIP;
  private _inverse = false;
  private _pipPosition: Position = Position.BottomRight;
  private _removeActivesArr: Function[] = [];
  private _videoSyncManager?: VideoSyncManager;
  private _playbackEnded = false;
  private _resolveReadyPromise = () => {};
  private _readyPromise = new Promise<void>(res => {
    this._resolveReadyPromise = res;
  });
  private _imagePlayer: ImagePlayer;
  private _secondaryPlayerType = PlayerType.VIDEO;

  /**
   * The default configuration of the plugin.
   * @type {VisibilityConfigObject}
   * @static
   */
  static defaultConfig: DualScreenConfig = {
    inverse: false,
    layout: Layout.PIP,
    childSizePercentage: 30,
    position: Position.BottomRight,
    secondaryPlayerType: PlayerType.VIDEO
  };

  constructor(name: string, player: any, config: DualScreenConfig) {
    super(name, player, config);
    this._player = player;
    this.secondaryKalturaPlayer = this._createSecondaryPlayer();
    this._imagePlayer = new ImagePlayer(this._setMode);
    this._addBindings();
    this._layout = this.config.layout;
    this._inverse = this.config.inverse;
    this._pipPosition = this.config.position;
  }

  getEngineDecorator(engine: any, dispatcher: Function) {
    return new DualScreenEngineDecorator(engine, this, dispatcher);
  }

  get ready() {
    return this._readyPromise;
  }

  getUIComponents() {
    return [
      {
        presets: PRESETS,
        container: ReservedPresetAreas.BottomBarRightControls,
        get: KalturaPlayer.ui.components.Remove,
        replaceComponent: KalturaPlayer.ui.components.Settings.displayName
      }
    ];
  }
  loadMedia(): void {
    this._getSecondaryMedia();
  }

  private _addBindings() {
    this.eventManager.listen(this.player, this.player.Event.RESIZE, (e: any) => {
      this.logger.debug(e);
    });
    this.eventManager.listen(this.player, this.player.Event.PLAYBACK_ENDED, () => {
      this._playbackEnded = true;
    });
    this.eventManager.listen(this.player, this.player.Event.PLAY, () => {
      if (this._playbackEnded) {
        // reset mode and pip-position on replay
        this._playbackEnded = false;
        this._resetMode();
        this._setMode();
      }
    });
  }

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

  private _getSecondaryPlayer = () => {
    return this._secondaryPlayerType === PlayerType.IMAGE ? this._imagePlayer : this.secondaryKalturaPlayer;
  };

  private _setMode = () => {
    if (this._layout === Layout.PIP) {
      this._inverse ? this._switchToPIPInverse(false) : this._switchToPIP(false);
      return;
    }
    if (this._layout === Layout.SingleMedia) {
      this._inverse ? this._switchToPIPMinimizedInverse(false) : this._switchToPIPMinimized(false);
      return;
    }
    this._switchToSideBySide(false);
  };

  private _resetMode = () => {
    this._layout = this.config.layout;
    this._inverse = this.config.inverse;
    this._pipPosition = this.config.position;
  };

  private _removeActives() {
    this._removeActivesArr.forEach(value => {
      value();
    });
    this._removeActivesArr = [];
  }

  private _setPipPosition = (position: Position) => {
    this._pipPosition = position;
  };

  public getPipPosition = (): Position => {
    return this._pipPosition;
  };

  private _switchToPIP = (manualChange: boolean, parentAnimation: Animations = Animations.None) => {
    setSubtitlesOnTop(true);
    if (manualChange) {
      this._layout = Layout.PIP;
      this._inverse = false;
    }
    this._removeActives();
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: PRESETS,
        container: ReservedPresetAreas.VideoContainer,
        get: () => <PipParent animation={parentAnimation} player={this._player} />
      })
    );
    const origPlayerParent: HTMLElement = this._player.getVideoElement().parentElement!;
    this._removeActivesArr.push(() => {
      origPlayerParent.appendChild(this._player.getVideoElement());
    });
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: PRESETS,
        container: ReservedPresetAreas.InteractiveArea,
        get: () => (
          <ResponsiveManager
            onMinSize={() => {
              this._switchToPIPMinimized(false);
            }}
            onDefaultSize={this._setMode}>
            <DragAndSnapManager
              eventManager={this.eventManager}
              logger={this.logger}
              getPosition={this.getPipPosition}
              onPositionChanged={this._setPipPosition}>
              <PipChild
                animation={Animations.Fade}
                playerSizePercentage={this.config.childSizePercentage}
                player={this._getSecondaryPlayer()}
                hide={() => this._switchToPIPMinimized(true)}
                onSideBySideSwitch={() => this._switchToSideBySide(true)}
                onInversePIP={() => this._switchToPIPInverse(true, Animations.Fade)}
              />
            </DragAndSnapManager>
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToPIPInverse = (manualChange: boolean, parentAnimation: Animations = Animations.None) => {
    setSubtitlesOnTop(true);

    if (manualChange) {
      this._layout = Layout.PIP;
      this._inverse = true;
    }
    this._removeActives();

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: PRESETS,
        container: ReservedPresetAreas.VideoContainer,
        get: () => <PipParent animation={parentAnimation} player={this._getSecondaryPlayer()} />
      })
    );
    const origPlayerParent: HTMLElement = this._player.getVideoElement().parentElement!;
    this._removeActivesArr.push(() => {
      origPlayerParent.appendChild(this._player.getVideoElement());
    });
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: PRESETS,
        container: ReservedPresetAreas.InteractiveArea,
        get: () => (
          <ResponsiveManager
            onMinSize={() => {
              this._switchToPIPMinimizedInverse(false);
            }}
            onDefaultSize={this._setMode}>
            <DragAndSnapManager
              eventManager={this.eventManager}
              logger={this.logger}
              getPosition={this.getPipPosition}
              onPositionChanged={this._setPipPosition}>
              <PipChild
                animation={Animations.Fade}
                playerSizePercentage={this.config.childSizePercentage}
                player={this._player}
                hide={() => this._switchToPIPMinimizedInverse(true)}
                onSideBySideSwitch={() => this._switchToSideBySide(true)}
                onInversePIP={() => this._switchToPIP(true, Animations.Fade)}
              />
            </DragAndSnapManager>
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToPIPMinimized = (manualChange: boolean, parentAnimation: Animations = Animations.None) => {
    setSubtitlesOnTop(false);

    if (manualChange) {
      this._layout = Layout.SingleMedia;
      this._inverse = false;
    }
    this._removeActives();
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: PRESETS,
        container: ReservedPresetAreas.VideoContainer,
        get: () => <PipParent animation={parentAnimation} player={this._player} />
      })
    );
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip-minimized',
        presets: PRESETS,
        container: ReservedPresetAreas.BottomBar,
        get: () => (
          <ResponsiveManager onDefaultSize={this._setMode}>
            <PipMinimized
              show={() => this._switchToPIP(true)}
              player={this._getSecondaryPlayer()}
              onInverse={() => this._switchToPIPMinimizedInverse(true, Animations.Fade)}
            />
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToPIPMinimizedInverse = (manualChange: boolean, parentAnimation: Animations = Animations.None) => {
    setSubtitlesOnTop(false);

    if (manualChange) {
      this._layout = Layout.SingleMedia;
      this._inverse = true;
    }
    this._removeActives();

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: PRESETS,
        container: ReservedPresetAreas.VideoContainer,
        get: () => <PipParent animation={parentAnimation} player={this._getSecondaryPlayer()} />
      })
    );
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip-minimized',
        presets: PRESETS,
        container: ReservedPresetAreas.BottomBar,
        get: () => (
          <ResponsiveManager onDefaultSize={this._setMode}>
            <PipMinimized
              show={() => this._switchToPIPInverse(true)}
              player={this._player}
              onInverse={() => this._switchToPIPMinimized(true, Animations.Fade)}
            />
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToSideBySide = (manualChange: boolean) => {
    setSubtitlesOnTop(true);

    if (manualChange) {
      this._layout = Layout.SideBySide;
    }
    this._removeActives();

    const origPlayerParent: HTMLElement = this._player.getVideoElement().parentElement!;
    this._removeActivesArr.push(() => {
      origPlayerParent.appendChild(this._player.getVideoElement());
    });

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-side-by-side',
        presets: PRESETS,
        container: ReservedPresetAreas.VideoContainer,
        get: () => (
          <SideBySideWrapper
            leftPlayer={this._player}
            rightPlayer={this._getSecondaryPlayer()}
            setMode={() => {
              this._setMode();
            }}
            switchToPIP={this._switchToPIP}
            switchToPIPMinimized={this._switchToPIPMinimized}
            switchToPIPInverse={this._switchToPIPInverse}
            inverse={this._inverse}
          />
        )
      })
    );
  };

  private _getSecondaryMedia() {
    this._player.provider
      .doRequest([{loader: SecondaryMediaLoader, params: {parentEntryId: this._player.getMediaInfo().entryId}}])
      .then((data: Map<string, any>) => {
        if (data && data.has(SecondaryMediaLoader.id)) {
          const secondaryMediaLoader = data.get(SecondaryMediaLoader.id);
          const entryId = secondaryMediaLoader?.response?.entries[0]?.id;
          const ks: string = this._player.config.session.ks;
          if (!entryId) {
            this.logger.warn('Secondary entry id not found');
            // subscribe on timed metadata events for image player
            this._secondaryPlayerType = PlayerType.IMAGE;
            this.eventManager.listen(this.player, this.player.Event.TIMED_METADATA, this._onTimedMetadata);
            this.eventManager.listen(this.player, 'timed_metadata_added', this._onTimedMetadataAdded); // TODO: should be enum from cuePointManager
            this._resolveReadyPromise();
          } else {
            // subscribe onf secondary player readiness
            this._secondaryPlayerType = PlayerType.VIDEO;
            this.eventManager.listenOnce(this.secondaryKalturaPlayer, EventType.CHANGE_SOURCE_ENDED, () => {
              this._resolveReadyPromise();
            });
            this._videoSyncManager = new VideoSyncManager(this.eventManager, this.player, this.secondaryKalturaPlayer, this.logger);
            this.eventManager.listen(this.secondaryKalturaPlayer, this.player.Event.FIRST_PLAYING, () => {
              this.logger.debug('secondary player first playing - show dual mode');
              this._setMode();
            });
            this.secondaryKalturaPlayer.loadMedia({entryId, ks});
          }
        }
      })
      .catch((e: any) => {
        this.logger.error(e);
      });
  }

  private _createSecondaryPlayer() {
    let secondaryPlaceholder = document.createElement('div');
    secondaryPlaceholder.setAttribute('id', 'secondaryPlaceholder');
    secondaryPlaceholder.style.width = '240px';
    secondaryPlaceholder.style.height = '135px';
    secondaryPlaceholder.hidden = true;
    document.body.appendChild(secondaryPlaceholder);
    const secondaryPlayerConfig = {
      targetId: 'secondaryPlaceholder',
      disableUserCache: true,
      playback: {
        muted: true
      },
      ui: {
        disable: true
      },
      provider: {
        partnerId: this._player.config.provider.partnerId
      },
      plugins: {
        dualscreen: {
          disable: true
        }
      }
    };
    return KalturaPlayer.setup(secondaryPlayerConfig);
  }

  /**
   * @static
   * @public
   * @returns {boolean} - Whether the plugin is valid.
   */
  static isValid(): boolean {
    return true;
  }

  destroy(): void {
    this.eventManager.destroy();
  }
}

// TEMP - for QA drop only
// @ts-ignore
window.addSlide = (url, startTime = Math.round(kalturaPlayer.currentTime), endTime = kalturaPlayer.currentTime + 10) => {
  let slideTrack;
  // @ts-ignore
  for (let track of kalturaPlayer.getVideoElement().textTracks) {
    if (track.kind === 'metadata' && track.label === 'KalturaCuePoints' && track.language === 'slides') {
      slideTrack = track;
    }
  }
  if (!slideTrack) {
    // @ts-ignore
    slideTrack = kalturaPlayer.getVideoElement().addTextTrack('metadata', 'KalturaCuePoints', 'slides');
  }
  let cue;
  if (window.VTTCue) {
    cue = new VTTCue(startTime, endTime, '');
  } else if (window.TextTrackCue) {
    cue = new Cue(startTime, endTime, '');
  }
  // @ts-ignore
  const cueValue = {key: 'KalturaCuePoint', data: {id: `${Date.now()}`, url}};
  // @ts-ignore
  cue.value = cueValue;
  slideTrack.addCue(cue);
  // @ts-ignore
  kalturaPlayer._pluginManager._plugins.dualscreen._player.dispatchEvent(
    new KalturaPlayer.core.FakeEvent('timed_metadata_added', {cues: [{value: cueValue}]})
  );
  return 'ok';
};
