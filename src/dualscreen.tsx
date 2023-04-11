import {h} from 'preact';
import {DualScreenConfig} from './types/DualScreenConfig';
import {PipChild, PipParent} from './components/pip';
import {Multiscreen, MultiscreenPlayer} from './components/multiscreen';
import {PipMinimized} from './components/pip-minimized';
import {
  Animations,
  Layout,
  PlayerType,
  Position,
  ReservedPresetAreas,
  ExternalLayout,
  ButtonsEnum,
  PlayerContainers,
  LayoutChangeProps
} from './enums';
import {VideoSyncManager} from './video-sync-manager';
import {ImageSyncManager} from './image-sync-manager';
import {ResponsiveManager} from './components/responsive-manager';
import {SecondaryMediaLoader} from './providers/secondary-media-loader';
import {DragAndSnapManager} from './components/drag-and-snap-manager';
import {SideBySideWrapper} from './components/side-by-side/side-by-side-wrapper';
import {getValueOrUndefined} from './utils';
import {DualScreenEngineDecorator} from './dualscreen-engine-decorator';
import {ImagePlayer, SlideItem} from './image-player';
// @ts-ignore
import {core, ui, BasePlugin, IEngineDecoratorProvider, KalturaPlayer} from 'kaltura-player-js';
import './styles/global.scss';

const {
  reducers: {shell}
} = ui;
const {EventType} = core;

const HAS_DUAL_SCREEN_PLUGIN_OVERLAY = 'has-dual-screen-plugin-overlay';
const PRESETS = ['Playback', 'Live', 'Ads'];
const IMAGE_PLAYER_ID = 'imagePlayer';
const MAIN_PLAYER_ID = 'mainPlayer';

interface DualScreenPlayer {
  id: string;
  type: PlayerType;
  container: PlayerContainers;
  player: KalturaPlayer | ImagePlayer;
}

export class DualScreen extends BasePlugin<DualScreenConfig> implements IEngineDecoratorProvider {
  private _layout: Layout;
  private _externalLayout: ExternalLayout | null = null;
  private _pipPosition: Position = Position.BottomRight;
  private _removeActivesArr: Function[] = [];
  private _imageSyncManager?: ImageSyncManager;
  private _playbackEnded = false;
  private _resolveReadyPromise = () => {};
  private _readyPromise: Promise<void>;
  private _pipPortraitMode = false;
  private _originalVideoElementParent?: HTMLElement;
  private _undoRemoveSettings?: Function | null = null;
  private _dualScreenPlayers: Array<DualScreenPlayer> = [];

  /**
   * The default configuration of the plugin.
   * @type {VisibilityConfigObject}
   * @static
   */
  static defaultConfig: DualScreenConfig = {
    layout: Layout.PIP,
    childSizePercentage: 30,
    childAspectRatio: {
      width: 16,
      height: 9
    },
    position: Position.BottomRight,
    slidesPreloadEnabled: true
  };

  constructor(name: string, player: KalturaPlayer, config: DualScreenConfig) {
    super(name, player, config);
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
    if (!this._undoRemoveSettings) {
      const removeSettings = {
        presets: PRESETS,
        container: ReservedPresetAreas.BottomBarRightControls,
        // @ts-ignore
        get: ui.Components.Remove,
        // @ts-ignore
        replaceComponent: ui.Components.Settings.displayName
      };
      this._undoRemoveSettings = this.player.ui.addComponent(removeSettings);
    }
  };

  loadMedia(): void {
    const imagePlayer = new ImagePlayer(this._onActiveSlideChanged, this.config.slidesPreloadEnabled);
    this._dualScreenPlayers = [
      {
        id: MAIN_PLAYER_ID,
        type: PlayerType.VIDEO,
        container: PlayerContainers.primary,
        player: this.player
      },
      {
        id: IMAGE_PLAYER_ID,
        type: PlayerType.IMAGE,
        container: PlayerContainers.none,
        player: imagePlayer
      }
    ];
    this._addBindings();
    const kalturaCuePointService: any = this.player.getService('kalturaCuepoints');
    this._getSecondaryMedia();
    if (kalturaCuePointService) {
      this._getThumbs(kalturaCuePointService);
      const imagePlayer = this.getDualScreenPlayer(IMAGE_PLAYER_ID)?.player as ImagePlayer;
      this._imageSyncManager = new ImageSyncManager(this.eventManager, this.player, imagePlayer as any, this.logger, this._onSlideViewChanged);
    } else {
      this.logger.warn('kalturaCuepoints service is not registered');
    }
  }

  reset(): void {
    this._setDefaultMode();
    this._layout = Layout.Hidden;
    this._dualScreenPlayers.forEach(dualScreenPlayer => {
      if (dualScreenPlayer.type === PlayerType.VIDEO && dualScreenPlayer.id !== MAIN_PLAYER_ID) {
        // @ts-ignore
        this._removeSecondaryPlaceholder(dualScreenPlayer.player.config?.targetId);
      }
      // this._removeSecondaryPlaceholder();
      // @ts-ignore
      dualScreenPlayer.player.destroy();
    });
    this._imageSyncManager?.reset();
    this._imageSyncManager = undefined;
    this._readyPromise = this._makeReadyPromise();
    if (this._undoRemoveSettings) {
      this._undoRemoveSettings();
      this._undoRemoveSettings = null;
    }
    this._dualScreenPlayers = [];
    this.eventManager.removeAll();
  }

  private _removeSecondaryPlaceholder(id: string) {
    const secondaryPlaceholderEl = document.getElementById(id);
    if (secondaryPlaceholderEl) {
      document.body.removeChild(secondaryPlaceholderEl);
    }
  }

  private _makeReadyPromise = () => {
    return new Promise<void>(res => {
      this._resolveReadyPromise = res;
    });
  };

  private _addBindings() {
    this.eventManager.listen(this.player, EventType.PLAYBACK_ENDED, () => {
      this._playbackEnded = true;
    });
    this.eventManager.listenOnce(this.player, EventType.FIRST_PLAY, () => {
      this._originalVideoElementParent = this.player.getVideoElement().parentElement!;
    });
    this.eventManager.listen(this.player, EventType.PLAY, () => {
      if (this._playbackEnded) {
        // reset mode and pip-position on replay
        this._playbackEnded = false;
        const secondaryPlayer = this.getActiveDualScreenPlayer(PlayerContainers.secondary) as DualScreenPlayer;
        if (secondaryPlayer.type === PlayerType.IMAGE && !(secondaryPlayer.player as ImagePlayer).active) {
          this._switchToHidden();
        } else {
          this._setDefaultMode();
          this._setMode();
        }
      }
    });
  }

  public getDualScreenPlayer = (id: string) => {
    return this._dualScreenPlayers.find(dualScreenPlayer => {
      return dualScreenPlayer.id === id;
    });
  };

  public getActiveDualScreenPlayer = (container: PlayerContainers.primary | PlayerContainers.secondary) => {
    return this._dualScreenPlayers.find(dualScreenPlayer => {
      return dualScreenPlayer.container === container;
    });
  };

  private _setActiveDualScreenPlayer = (id: string, container: PlayerContainers) => {
    const resetPlayer = this._dualScreenPlayers.find(dualScreenPlayer => dualScreenPlayer.container === container)!;
    this._dualScreenPlayers = this._dualScreenPlayers.map(dualScreenPlayer => {
      if (dualScreenPlayer.id === resetPlayer.id) {
        return {
          ...dualScreenPlayer,
          container: PlayerContainers.none
        };
      }
      return {
        ...dualScreenPlayer,
        container: dualScreenPlayer.id === id ? container : dualScreenPlayer.container
      };
    });
  };

  private _getMultiscreenPlayers = () => {
    return this._dualScreenPlayers.filter(dualScreenPlayer => dualScreenPlayer.container === PlayerContainers.none);
  };

  private _makeMultiscreenPlayers = (invert = false) => {
    return this._getMultiscreenPlayers().map(dualScreenPlayer => {
      const multiScreenPlayerProps: MultiscreenPlayer = {
        player: dualScreenPlayer.player,
        setPrimary: () => {},
        setSecondary: null
      };
      if (this._layout === Layout.PIP) {
        multiScreenPlayerProps['setSecondary'] = () => {
          this._setActiveDualScreenPlayer(dualScreenPlayer.id, PlayerContainers.secondary);
          this._setMode(true);
        };
        multiScreenPlayerProps['setPrimary'] = () => {
          this._setActiveDualScreenPlayer(dualScreenPlayer.id, PlayerContainers.primary);
          this._setMode(true);
        };
      } else {
        multiScreenPlayerProps['setPrimary'] = () => {
          this._setActiveDualScreenPlayer(dualScreenPlayer.id, invert ? PlayerContainers.secondary : PlayerContainers.primary);
          this._setMode(true);
        };
      }
      return multiScreenPlayerProps;
    });
  };

  private _setMode = (force?: boolean) => {
    switch (this._layout) {
      case Layout.PIP:
        this._switchToPIP({force});
        break;
      case Layout.PIPInverse:
        this._applyInverse();
        this._switchToPIP({force});
        break;
      case Layout.SingleMedia:
        this._switchToSingleMedia({force});
        break;
      case Layout.SingleMediaInverse:
        this._applyInverse();
        this._switchToSingleMedia({force});
        break;
      case Layout.SideBySide:
        this._switchToSideBySide({force});
        break;
      case Layout.SideBySideInverse:
        this._applyInverse();
        this._switchToSideBySide({force});
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
    const configLayouts = [Layout.PIP, Layout.PIPInverse, Layout.SideBySide, Layout.SideBySideInverse, Layout.SingleMedia, Layout.SingleMediaInverse];
    this._layout = configLayouts.includes(this.config.layout) ? this.config.layout : Layout.Hidden;
    this._pipPosition = this.config.position;
    this._pipPortraitMode = false;
    this._externalLayout = null;
  };

  private _addActives(...removeActives: Array<Function>) {
    const {
      store: {dispatch}
    } = this.player.ui;
    // @ts-ignore
    dispatch(shell.actions.addPlayerClass(HAS_DUAL_SCREEN_PLUGIN_OVERLAY));
    this._removeActives();
    this._removeActivesArr = removeActives;
  }

  private _removeActives() {
    this._removeActivesArr.forEach(value => {
      value();
    });
    this._removeActivesArr = [];
    if (this._originalVideoElementParent) {
      this._originalVideoElementParent.prepend(this.player.getVideoElement());
    }
  }

  private _setPipPosition = (position: Position) => {
    this._pipPosition = position;
  };

  public getPipPosition = (): Position => {
    return this._pipPosition;
  };

  private _applyInverse = () => {
    this._dualScreenPlayers = this._dualScreenPlayers.map(dualScreenPlayer => {
      if (dualScreenPlayer.container === PlayerContainers.none) {
        return dualScreenPlayer;
      }
      return {
        ...dualScreenPlayer,
        container: dualScreenPlayer.container === PlayerContainers.primary ? PlayerContainers.secondary : PlayerContainers.primary
      };
    });
  };

  private _switchToHidden = () => {
    const {
      store: {dispatch}
    } = this.player.ui;
    this._layout = Layout.Hidden;
    // @ts-ignore
    dispatch(shell.actions.removePlayerClass(HAS_DUAL_SCREEN_PLUGIN_OVERLAY));
    this._removeActives();
  };

  private _switchToPIP = ({animation = Animations.None, focusOnButton, force}: LayoutChangeProps = {}) => {
    const imagePlayer = this.getDualScreenPlayer(IMAGE_PLAYER_ID)?.player as ImagePlayer;
    if (!force && this._layout === Layout.PIP && this._removeActivesArr.length && imagePlayer.active?.portrait === this._pipPortraitMode) {
      return;
    }
    this._layout = Layout.PIP;
    this._setPipPortraitMode();

    this._addActives(
      this.player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: PRESETS,
        container: ReservedPresetAreas.VideoContainer,
        get: () => <PipParent animation={animation} player={this.getActiveDualScreenPlayer(PlayerContainers.primary)!.player as any} />
      }),
      this.player.ui.addComponent({
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
                player={this.getActiveDualScreenPlayer(PlayerContainers.secondary)!.player as any}
                hide={(byKeyboard: boolean) =>
                  this._switchToSingleMedia({animation: Animations.None, focusOnButton: getValueOrUndefined(byKeyboard, ButtonsEnum.Show)})
                }
                onSideBySideSwitch={(byKeyboard: boolean) =>
                  this._switchToSideBySide({focusOnButton: byKeyboard ? ButtonsEnum.SideBySide : undefined})
                }
                onInversePIP={(byKeyboard: boolean) => {
                  this._applyInverse();
                  this._layout = Layout.PIPInverse; // toggle layout change
                  this._switchToPIP({animation: Animations.Fade, focusOnButton: getValueOrUndefined(byKeyboard, ButtonsEnum.SwitchScreen)});
                }}
                portrait={this._pipPortraitMode}
                aspectRatio={this.config.childAspectRatio}
                focusOnButton={focusOnButton}
                layout={this._layout}
                multiscreen={<Multiscreen players={this._makeMultiscreenPlayers()} icon="switch" />}
              />
            </DragAndSnapManager>
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToSingleMedia = ({animation = Animations.None, focusOnButton, force}: LayoutChangeProps = {}) => {
    if (!force && this._layout === Layout.SingleMedia && this._removeActivesArr.length) {
      return;
    }
    this._layout = Layout.SingleMedia;

    this._addActives(
      this.player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: PRESETS,
        container: ReservedPresetAreas.VideoContainer,
        get: () => <PipParent animation={animation} player={this.getActiveDualScreenPlayer(PlayerContainers.primary)!.player as any} />
      }),
      this.player.ui.addComponent({
        label: 'kaltura-dual-screen-pip-minimized',
        presets: PRESETS,
        container: ReservedPresetAreas.BottomBar,
        get: () => (
          <ResponsiveManager onDefaultSize={this._setMode}>
            <PipMinimized
              show={(byKeyboard: boolean) =>
                this._switchToPIP({animation: Animations.None, focusOnButton: getValueOrUndefined(byKeyboard, ButtonsEnum.Hide)})
              }
              player={this.getActiveDualScreenPlayer(PlayerContainers.secondary)!.player as any}
              onInverse={(byKeyboard: boolean) => {
                this._layout = Layout.SingleMediaInverse; // toggle layout change
                this._applyInverse();
                this._switchToSingleMedia({
                  animation: Animations.Fade,
                  focusOnButton: getValueOrUndefined(byKeyboard, ButtonsEnum.SwitchScreen)
                });
              }}
              focusOnButton={focusOnButton}
              multiscreen={<Multiscreen players={this._makeMultiscreenPlayers()} icon="switch" />}
            />
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToSideBySide = ({animation = Animations.None, focusOnButton, force}: LayoutChangeProps = {}) => {
    if (!force && this._layout === Layout.SideBySide && this._removeActivesArr.length) {
      return;
    }
    this._layout = Layout.SideBySide;

    const leftSideProps = {
      player: this.getActiveDualScreenPlayer(PlayerContainers.primary)!.player as any,
      onExpand: (byKeyboard: boolean) =>
        this._switchToPIP({animation: Animations.ScaleRight, focusOnButton: getValueOrUndefined(byKeyboard, ButtonsEnum.SideBySide)}),
      focusOnButton: Boolean(focusOnButton),
      multiscreen: <Multiscreen players={this._makeMultiscreenPlayers()} icon="switch" />
    };
    const rightSideProps = {
      player: this.getActiveDualScreenPlayer(PlayerContainers.secondary)!.player as any,
      onExpand: (byKeyboard: boolean) => {
        this._applyInverse();
        this._switchToPIP({animation: Animations.ScaleLeft, focusOnButton: getValueOrUndefined(byKeyboard, ButtonsEnum.SideBySide)});
      },
      multiscreen: <Multiscreen players={this._makeMultiscreenPlayers(true)} icon="switch" />
    };

    this._addActives(
      this.player.ui.addComponent({
        label: 'kaltura-dual-screen-side-by-side',
        presets: PRESETS,
        container: ReservedPresetAreas.VideoContainer,
        get: () => (
          <SideBySideWrapper
            leftSideProps={leftSideProps}
            rightSideProps={rightSideProps}
            layout={this._layout}
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

    if (this._layout === Layout.Hidden && this._externalLayout) {
      this._applyExternalLayout();
    }

    let portraitModeChanged = false;
    if (slideItem.portrait !== this._pipPortraitMode) {
      portraitModeChanged = true;
    }

    if (originalHiddenLayout || (portraitModeChanged && this._layout === Layout.PIP)) {
      // update PIP component
      this._setMode();
    }

    this._removeSettingsComponent();
  };

  private _getThumbs(kalturaCuePointService: any) {
    kalturaCuePointService?.registerTypes([kalturaCuePointService.CuepointType.SLIDE, kalturaCuePointService.CuepointType.VIEW_CHANGE]);
  }

  private _onSlideViewChanged = (viewChange: ExternalLayout) => {
    if (this._externalLayout === viewChange) {
      return;
    }
    this._externalLayout = viewChange;
    this._applyExternalLayout();
  };

  private _applyExternalLayout = () => {
    switch (this._externalLayout) {
      case ExternalLayout.Hidden:
        this._switchToHidden();
        break;
      case ExternalLayout.SingleMedia:
        if (this._layout !== Layout.SingleMedia) {
          this._switchToSingleMedia();
        }
        break;
      case ExternalLayout.SingleMediaInverse:
        if (this._layout !== Layout.SingleMediaInverse) {
          this._applyInverse();
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
          this._applyInverse();
          this._switchToPIP();
        }
        break;
      case ExternalLayout.SideBySide:
        if (this._layout !== Layout.SideBySide) {
          this._switchToSideBySide();
        }
        break;
      case ExternalLayout.SideBySideInverse:
        if (this._layout !== Layout.SideBySideInverse) {
          this._applyInverse();
          this._switchToSideBySide();
        }
        break;
    }
  };

  private _getSecondaryMedia() {
    // @ts-ignore
    this.player.provider
      // @ts-ignore
      .doRequest([{loader: SecondaryMediaLoader, params: {parentEntryId: this.player.sources.id}}])
      .then((data: Map<string, any>) => {
        if (data && data.has(SecondaryMediaLoader.id)) {
          const secondaryMediaLoader = data.get(SecondaryMediaLoader.id);
          secondaryMediaLoader?.response?.entries?.forEach((mediaEntry: any, index: number) => {
            const kalturaPlayer = this._createSecondaryPlayer(mediaEntry.id);
            this._dualScreenPlayers.push({
              id: mediaEntry.id,
              player: kalturaPlayer,
              type: PlayerType.VIDEO,
              container: index === 0 ? PlayerContainers.secondary : PlayerContainers.none
            });
            new VideoSyncManager(this.eventManager, this.player, kalturaPlayer, this.logger);
          });
          if (this._dualScreenPlayers.length) {
            this._removeSettingsComponent();
            const secondaryPlayer: any = this.getActiveDualScreenPlayer(PlayerContainers.secondary)?.player;
            this.eventManager.listenOnce(secondaryPlayer, EventType.CHANGE_SOURCE_ENDED, () => {
              this._resolveReadyPromise();
            });
            this.eventManager.listenOnce(secondaryPlayer, EventType.FIRST_PLAYING, () => {
              this.logger.debug('secondary player first playing - show dual mode');
              this._setDefaultMode();
              this._setMode();
            });
          } else {
            this.logger.trace('child media not found');
            this._resolveReadyPromise();
          }
        } else {
          this.logger.warn('SecondaryMediaLoader does not exist');
          this._resolveReadyPromise();
          this.eventManager.removeAll();
        }
      })
      .catch((e: any) => {
        this.logger.error(e);
        this._resolveReadyPromise();
      });
  }

  private _createSecondaryPlayer(entryId: string): KalturaPlayer {
    const targetId = `secondaryPlaceholder-${entryId}`;
    let secondaryPlaceholder = document.createElement('div');
    secondaryPlaceholder.setAttribute('id', targetId);
    secondaryPlaceholder.style.width = '240px';
    secondaryPlaceholder.style.height = '135px';
    secondaryPlaceholder.hidden = true;
    document.body.appendChild(secondaryPlaceholder);
    const secondaryPlayerConfig = {
      targetId,
      disableUserCache: true,
      playback: {
        muted: true,
        autoplay: false
      },
      ui: {
        disable: true
      },
      provider: {
        // @ts-ignore
        ...this.player.config.provider,
        ignoreServerConfig: true
      },
      plugins: {
        'kaltura-live': {
          // @ts-ignore
          ...(this.player.plugins['kaltura-live']?.config || {})
        }
      }
    };
    const secondaryPlayer = (window as any).KalturaPlayer.setup(secondaryPlayerConfig);
    // @ts-ignore
    secondaryPlayer.loadMedia({entryId, ks: this.player.config.session.isAnonymous ? '' : this.player.config.session.ks});
    return secondaryPlayer;
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

  private _setPipPortraitMode() {
    const secondaryPlayer = this.getActiveDualScreenPlayer(PlayerContainers.secondary) as DualScreenPlayer;
    if (secondaryPlayer.type === PlayerType.VIDEO && secondaryPlayer.player) {
      const secondaryVideoWidth = (secondaryPlayer.player as KalturaPlayer).getVideoElement().videoWidth;
      const secondaryVideoHeight = (secondaryPlayer.player as KalturaPlayer).getVideoElement().videoHeight;
      this._pipPortraitMode = secondaryVideoWidth < secondaryVideoHeight || this._pipPortraitMode;
    } else {
      this._pipPortraitMode = (secondaryPlayer.player as ImagePlayer).active
        ? (secondaryPlayer.player as ImagePlayer).active!.portrait
        : this._pipPortraitMode;
    }
  }
}
