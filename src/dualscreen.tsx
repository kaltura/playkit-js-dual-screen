import {h} from 'preact';
import {DualScreenConfig} from './types/DualScreenConfig';
import {PipChild, PipParent} from './components/pip';
import {PipMinimized} from './components/pip-minimized';
import {Animations, Layout, PlayerType, Position, ReservedPresetAreas, ExternalLayout, ButtonsEnum} from './enums';
import {VideoSyncManager} from './video-sync-manager';
import {ImageSyncManager} from './image-sync-manager';
import {ResponsiveManager} from './components/responsive-manager';
import {SecondaryMediaLoader} from './providers/secondary-media-loader';
import {DragAndSnapManager} from './components/drag-and-snap-manager';
import {SideBySideWrapper} from './components/side-by-side/side-by-side-wrapper';
import {setSubtitlesOnTop, getValueOrUndefined} from './utils';
import {DualScreenEngineDecorator} from './dualscreen-engine-decorator';
import {ImagePlayer, SlideItem} from './image-player';
// @ts-ignore
import {core} from 'kaltura-player-js';

const {EventType} = core;

const PRESETS = ['Playback', 'Live', 'Ads'];
// @ts-ignore
export class DualScreen extends KalturaPlayer.core.BasePlugin implements IEngineDecoratorProvider {
  public secondaryKalturaPlayer?: KalturaPlayerTypes.Player | any;
  private _player: KalturaPlayerTypes.Player;
  private _layout: Layout;
  private _externalLayout: ExternalLayout | null = null;
  private _pipPosition: Position = Position.BottomRight;
  private _removeActivesArr: Function[] = [];
  private _videoSyncManager?: VideoSyncManager;
  private _imageSyncManager?: ImageSyncManager;
  private _playbackEnded = false;
  private _resolveReadyPromise = () => {};
  private _readyPromise: Promise<void>;
  private _imagePlayer: ImagePlayer;
  private _secondaryPlayerType = PlayerType.VIDEO;
  private _pipPortraitMode = false;
  private _originalVideoElementParent?: HTMLElement;
  private _undoRemoveSettings = () => {};

  /**
   * The default configuration of the plugin.
   * @type {VisibilityConfigObject}
   * @static
   */
  static defaultConfig: DualScreenConfig = {
    inverse: false,
    layout: Layout.PIP,
    childSizePercentage: 30,
    childAspectRatio: {
      width: 16,
      height: 9
    },
    position: Position.BottomRight,
    slidesPreloadEnabled: true
  };

  constructor(name: string, player: any, config: DualScreenConfig) {
    super(name, player, config);
    this._player = player;
    this._imagePlayer = new ImagePlayer(this._onActiveSlideChanged, this.config.slidesPreloadEnabled);
    this._readyPromise = this._makeReadyPromise();
    this._layout = Layout.Hidden;
    this._pipPosition = this.config.position;
  }

  getEngineDecorator(engine: any, dispatcher: Function) {
    return new DualScreenEngineDecorator(engine, this, dispatcher);
  }

  get ready() {
    return this._readyPromise;
  }

  private _removeSettingsComponent = () => {
    const removeSettings =
        {
          presets: PRESETS,
          container: ReservedPresetAreas.BottomBarRightControls,
          get: KalturaPlayer.ui.components.Remove,
          replaceComponent: KalturaPlayer.ui.components.Settings.displayName
        }
    this._undoRemoveSettings = this._player.ui.addComponent(removeSettings);
    this.secondaryKalturaPlayer = this._createSecondaryPlayer();
  }

  loadMedia(): void {
    this._addBindings();
    const kalturaCuePointService: any = this._player.getService('kalturaCuepoints');
    this._getSecondaryMedia();
    if (kalturaCuePointService) {
      this._getThumbs(kalturaCuePointService);
    } else {
      this.logger.warn('kalturaCuepoints service is not registered');
    }
  }

  reset(): void {
    this._setDefaultMode();
    this._imagePlayer.reset();
    this._imageSyncManager?.reset();
    this._readyPromise = this._makeReadyPromise();
    this._undoRemoveSettings();
    this._undoRemoveSettings = () => {};
    this.secondaryKalturaPlayer?.destroy();
    this.secondaryKalturaPlayer = null;
    this.eventManager.removeAll();
  }

  private _makeReadyPromise = () => {
    return new Promise<void>(res => {
      this._resolveReadyPromise = res;
    });
  };

  private _addBindings() {
    this.eventManager.listen(this.player, this.player.Event.PLAYBACK_ENDED, () => {
      this._playbackEnded = true;
    });
    this.eventManager.listenOnce(this.player, this.player.Event.FIRST_PLAY, () => {
      this._originalVideoElementParent = this.player.getVideoElement().parentElement!;
    });
    this.eventManager.listen(this.player, this.player.Event.PLAY, () => {
      if (this._playbackEnded) {
        // reset mode and pip-position on replay
        this._playbackEnded = false;
        if (this._secondaryPlayerType === PlayerType.IMAGE && !this._imagePlayer.active) {
          this._switchToHidden();
        } else {
          this._setDefaultMode();
          this._setMode();
        }
      }
    });
  }

  private _getSecondaryPlayer = () => {
    return this._secondaryPlayerType === PlayerType.IMAGE ? this._imagePlayer : this.secondaryKalturaPlayer;
  };

  private _setMode = () => {
    switch (this._layout) {
      case Layout.PIP:
        this._switchToPIP();
        break;
      case Layout.PIPInverse:
        this._switchToPIPInverse();
        break;
      case Layout.SingleMedia:
        this._switchToSingleMedia();
        break;
      case Layout.SingleMediaInverse:
        this._switchToSingleMediaInverse();
        break;
      case Layout.SideBySide:
        this._switchToSideBySide();
        break;
      case Layout.SideBySideInverse:
        this._switchToSideBySideInverse();
        break;
      case Layout.Hidden:
        this._switchToHidden();
        break;
      default:
        this.logger.warn('unrecognized layout, got:', this._layout);
    }
  };

  private _setDefaultMode = () => {
    this._switchToHidden();
    switch (this.config.layout) {
      case Layout.PIP:
        this._layout = this.config.inverse ? Layout.PIPInverse : Layout.PIP;
        break;
      case Layout.SideBySide:
        this._layout = this.config.inverse ? Layout.SideBySideInverse : Layout.SideBySide;
        break;
      case Layout.SingleMedia:
        this._layout = this.config.inverse ? Layout.SingleMediaInverse : Layout.SingleMedia;
        break;
      default:
        this._layout = Layout.Hidden;
    }
    this._pipPosition = this.config.position;
    this._pipPortraitMode = false;
    this._externalLayout = null;
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

  private _switchToHidden = () => {
    this._layout = Layout.Hidden;
    setSubtitlesOnTop(false);
    this._removeActives();
  };

  private _switchToPIP = (parentAnimation: Animations = Animations.None, focusOnButton?: ButtonsEnum) => {
    if (this._layout === Layout.PIP && this._removeActivesArr.length && this._imagePlayer.active?.portrait === this._pipPortraitMode) {
      return;
    }
    this._pipPortraitMode = this._imagePlayer.active ? this._imagePlayer.active.portrait : this._pipPortraitMode;
    this._layout = Layout.PIP;

    setSubtitlesOnTop(true);
    this._removeActives();

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: PRESETS,
        container: ReservedPresetAreas.VideoContainer,
        get: () => <PipParent animation={parentAnimation} player={this._player} />
      })
    );
    this._removeActivesArr.push(() => {
      this._originalVideoElementParent!.appendChild(this._player.getVideoElement());
    });
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: PRESETS,
        container: ReservedPresetAreas.InteractiveArea,
        get: () => (
          <ResponsiveManager
            onMinSize={() => {
              this._switchToSingleMedia();
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
                hide={(byKeyboard: boolean) => this._switchToSingleMedia(Animations.None, getValueOrUndefined(byKeyboard, ButtonsEnum.Show))}
                onSideBySideSwitch={(byKeyboard: boolean) => this._switchToSideBySide(byKeyboard)}
                onInversePIP={(byKeyboard: boolean) =>
                  this._switchToPIPInverse(Animations.Fade, getValueOrUndefined(byKeyboard, ButtonsEnum.SwitchScreen))
                }
                portrait={this._pipPortraitMode}
                aspectRatio={this.config.childAspectRatio}
                focusOnButton={focusOnButton}
              />
            </DragAndSnapManager>
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToPIPInverse = (parentAnimation: Animations = Animations.None, focusOnButton?: ButtonsEnum) => {
    if (this._layout === Layout.PIPInverse && this._removeActivesArr.length) {
      return;
    }
    this._layout = Layout.PIPInverse;

    setSubtitlesOnTop(true);
    this._removeActives();

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: PRESETS,
        container: ReservedPresetAreas.VideoContainer,
        get: () => <PipParent animation={parentAnimation} player={this._getSecondaryPlayer()} />
      })
    );
    this._removeActivesArr.push(() => {
      this._originalVideoElementParent!.appendChild(this._player.getVideoElement());
    });
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: PRESETS,
        container: ReservedPresetAreas.InteractiveArea,
        get: () => (
          <ResponsiveManager
            onMinSize={() => {
              this._switchToSingleMediaInverse();
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
                hide={(byKeyboard: boolean) =>
                  this._switchToSingleMediaInverse(Animations.None, getValueOrUndefined(byKeyboard, ButtonsEnum.Show))
                }
                onSideBySideSwitch={(byKeyboard: boolean) => this._switchToSideBySideInverse(byKeyboard)}
                onInversePIP={(byKeyboard: boolean) =>
                  this._switchToPIP(Animations.Fade, getValueOrUndefined(byKeyboard, ButtonsEnum.SwitchScreen))
                }
                aspectRatio={this.config.childAspectRatio}
                focusOnButton={focusOnButton}
              />
            </DragAndSnapManager>
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToSingleMedia = (parentAnimation: Animations = Animations.None, focusOnButton?: ButtonsEnum) => {
    if (this._layout === Layout.SingleMedia && this._removeActivesArr.length) {
      return;
    }
    this._layout = Layout.SingleMedia;

    setSubtitlesOnTop(true);
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
              show={(byKeyboard: boolean) => this._switchToPIP(Animations.None, getValueOrUndefined(byKeyboard, ButtonsEnum.Hide))}
              player={this._getSecondaryPlayer()}
              onInverse={(byKeyboard: boolean) =>
                this._switchToSingleMediaInverse(Animations.Fade, getValueOrUndefined(byKeyboard, ButtonsEnum.SwitchScreen))
              }
              focusOnButton={focusOnButton}
            />
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToSingleMediaInverse = (parentAnimation: Animations = Animations.None, focusOnButton?: ButtonsEnum) => {
    if (this._layout === Layout.SingleMediaInverse && this._removeActivesArr.length) {
      return;
    }
    this._layout = Layout.SingleMediaInverse;

    setSubtitlesOnTop(true);
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
              show={(byKeyboard: boolean) => this._switchToPIPInverse(Animations.None, getValueOrUndefined(byKeyboard, ButtonsEnum.Hide))}
              player={this._player}
              onInverse={(byKeyboard: boolean) =>
                this._switchToSingleMedia(Animations.Fade, getValueOrUndefined(byKeyboard, ButtonsEnum.SwitchScreen))
              }
              focusOnButton={focusOnButton}
            />
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToSideBySide = (focusOnButton?: boolean) => {
    if (this._layout === Layout.SideBySide && this._removeActivesArr.length) {
      return;
    }
    this._layout = Layout.SideBySide;

    setSubtitlesOnTop(true);
    this._removeActives();

    this._removeActivesArr.push(() => {
      this._originalVideoElementParent!.appendChild(this._player.getVideoElement());
    });

    const leftSideProps = {
      player: this._player,
      onExpand: (byKeyboard: boolean) => this._switchToPIP(Animations.ScaleRight, getValueOrUndefined(byKeyboard, ButtonsEnum.SideBySide)),
      focusOnButton
    };
    const rightSideProps = {
      player: this._getSecondaryPlayer(),
      onExpand: (byKeyboard: boolean) => this._switchToPIPInverse(Animations.ScaleLeft, getValueOrUndefined(byKeyboard, ButtonsEnum.SideBySide))
    };

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-side-by-side',
        presets: PRESETS,
        container: ReservedPresetAreas.VideoContainer,
        get: () => (
          <SideBySideWrapper
            leftSideProps={leftSideProps}
            rightSideProps={rightSideProps}
            onSizeChange={this._setMode}
            onMinSize={this._switchToSingleMedia}
          />
        )
      })
    );
  };

  private _switchToSideBySideInverse = (focusOnButton?: boolean) => {
    if (this._layout === Layout.SideBySideInverse && this._removeActivesArr.length) {
      return;
    }
    this._layout = Layout.SideBySideInverse;

    setSubtitlesOnTop(true);
    this._removeActives();

    this._removeActivesArr.push(() => {
      this._originalVideoElementParent!.appendChild(this._player.getVideoElement());
    });

    const leftSideProps = {
      player: this._getSecondaryPlayer(),
      onExpand: (byKeyboard: boolean) =>
        this._switchToPIPInverse(Animations.ScaleRight, getValueOrUndefined(byKeyboard, ButtonsEnum.SideBySide)),
      focusOnButton
    };
    const rightSideProps = {
      player: this._player,
      onExpand: (byKeyboard: boolean) => this._switchToPIP(Animations.ScaleLeft, getValueOrUndefined(byKeyboard, ButtonsEnum.SideBySide))
    };

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-side-by-side',
        presets: PRESETS,
        container: ReservedPresetAreas.VideoContainer,
        get: () => (
          <SideBySideWrapper
            leftSideProps={leftSideProps}
            rightSideProps={rightSideProps}
            onSizeChange={this._setMode}
            onMinSize={this._switchToSingleMedia}
          />
        )
      })
    );
  };

  private _onActiveSlideChanged = (slideItem: SlideItem | null) => {
    if (!slideItem) {
      // deactivate dual-screen layout
      this._switchToHidden();
      return;
    }

    let originalHiddenLayout = false;
    if (this._layout === Layout.Hidden && !this._externalLayout) {
      originalHiddenLayout = true;
      this._setDefaultMode();
    }

    let portraitModeChanged = false;
    if (slideItem.portrait !== this._pipPortraitMode) {
      portraitModeChanged = true;
    }

    if (originalHiddenLayout || (portraitModeChanged && this._layout === Layout.PIP)) {
      // update PIP component
      this._setMode();
    }
  };

  private _getThumbs(kalturaCuePointService: any) {
    kalturaCuePointService?.registerTypes([kalturaCuePointService.CuepointType.SLIDE, kalturaCuePointService.CuepointType.VIEW_CHANGE]);
  }

  private _onSlideViewChanged = (viewChange: ExternalLayout) => {
    if (this._externalLayout === viewChange) {
      return;
    }
    this._externalLayout = viewChange;
    switch (this._externalLayout) {
      case ExternalLayout.Hidden:
        this._switchToHidden();
        break;
      case ExternalLayout.SingleMedia:
        if (this._layout !== Layout.SingleMedia) {
          this._switchToSingleMedia();
        }
        break;
      case ExternalLayout.PIP:
        if (this._layout !== Layout.PIP) {
          this._switchToPIP();
        }
        break;
      case ExternalLayout.PIPInverse:
        if (this._layout !== Layout.PIPInverse) {
          this._switchToPIPInverse();
        }
        break;
      case ExternalLayout.SideBySide:
        if (this._layout !== Layout.SideBySide) {
          this._switchToSideBySide();
        }
        break;
      case ExternalLayout.SideBySideInverse:
        if (this._layout !== Layout.SideBySideInverse) {
          this._switchToSideBySideInverse();
        }
        break;
    }
  };

  private _getSecondaryMedia() {
    this._player.provider
      .doRequest([{loader: SecondaryMediaLoader, params: {parentEntryId: this._player.sources.id}}])
      .then((data: Map<string, any>) => {
        if (data && data.has(SecondaryMediaLoader.id)) {
          const secondaryMediaLoader = data.get(SecondaryMediaLoader.id);
          const entryId = secondaryMediaLoader?.response?.entries[0]?.id;
          if (entryId) {
            // subscribe on secondary player readiness
            this._secondaryPlayerType = PlayerType.VIDEO;
            this._removeSettingsComponent();
            this.eventManager.listenOnce(this.secondaryKalturaPlayer, EventType.CHANGE_SOURCE_ENDED, () => {
              this._resolveReadyPromise();
            });
            this._videoSyncManager = new VideoSyncManager(this.eventManager, this.player, this.secondaryKalturaPlayer, this.logger);
            this.eventManager.listen(this.secondaryKalturaPlayer, this.player.Event.FIRST_PLAYING, () => {
              this.logger.debug('secondary player first playing - show dual mode');
              this._setDefaultMode();
              this._setMode();
            });
            this.secondaryKalturaPlayer.loadMedia({entryId, ks: this.player.config.session.isAnonymous ? '' : this.player.config.session.ks});
          } else {
            this.logger.warn('Secondary entry id not found');
            // subscribe on timed metadata events for image player
            this._secondaryPlayerType = PlayerType.IMAGE;

            if (this.player.getService('kalturaCuepoints')) {
              this._imageSyncManager = new ImageSyncManager(this.eventManager, this.player, this._imagePlayer, this.logger, this._onSlideViewChanged, this._removeSettingsComponent);
            }
            this._resolveReadyPromise();
          }
        }
      })
      .catch((e: any) => {
        this.logger.error(e);
        this._resolveReadyPromise();
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
        ...this._player.config.provider,
        ignoreServerConfig: true
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
