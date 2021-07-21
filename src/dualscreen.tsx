import {DualScreenConfig} from './types/DualScreenConfig';
import {h} from 'preact';
import {PipChild, PipParent} from './components/pip';
import {PipMinimized} from './components/pip-minimized';
import {SideBySide} from './components/side-by-side';
import {Position, Animations, Layout, ReservedPresetAreas} from './enums';
import {VideoSyncManager} from './videoSyncManager';
import {ResponsiveManager} from './components/responsive-manager';
import {SecondaryMediaLoader} from './providers/secondary-media-loader';
import {DragAndSnapManager} from './components/drag-and-snap-manager';
import {SideBySideWrapper} from './components/side-by-side/side-by-side-wrapper';
import {setSubtitlesOnTop} from './utils';

const PRESETS = ['Playback', 'Live', 'Ads'];
export class DualScreen extends KalturaPlayer.core.BasePlugin {
  private _player: KalturaPlayerTypes.Player;
  private _secondaryKalturaPlayer: KalturaPlayerTypes.Player;
  private _layout: Layout = Layout.PIP;
  private _inverse = false;
  private _pipPosition: Position = Position.BottomRight;
  private _removeActivesArr: Function[] = [];
  private _videoSyncManager?: VideoSyncManager;
  private _playbackEnded = false;

  /**
   * The default configuration of the plugin.
   * @type {VisibilityConfigObject}
   * @static
   */
  static defaultConfig: DualScreenConfig = {
    inverse: false,
    layout: Layout.PIP,
    childSizePercentage: 30,
    position: Position.BottomRight
  };

  constructor(name: string, player: any, config: DualScreenConfig) {
    super(name, player, config);
    this._player = player;
    this._addBindings();
    this._secondaryKalturaPlayer = this._createSecondaryPlayer();
    this._layout = this.config.layout;
    this._inverse = this.config.inverse;
    this._pipPosition = this.config.position;
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
                player={this._secondaryKalturaPlayer}
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
        get: () => <PipParent animation={parentAnimation} player={this._secondaryKalturaPlayer} />
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
              childPlayer={this._secondaryKalturaPlayer}
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
        get: () => <PipParent animation={parentAnimation} player={this._secondaryKalturaPlayer} />
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
              childPlayer={this._player}
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
            primaryPlayer={this._player}
            secondaryPlayer={this._secondaryKalturaPlayer}
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
          } else {
            this._secondaryKalturaPlayer.loadMedia({entryId, ks});
            this._videoSyncManager = new VideoSyncManager(this.eventManager, this.player, this._secondaryKalturaPlayer, this.logger);
            this.eventManager.listen(this._secondaryKalturaPlayer, this.player.Event.FIRST_PLAYING, () => {
              this.logger.debug('secondary player first playing - show dual mode');
              this._setMode();
            });
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
    if (this._videoSyncManager) {
      this._videoSyncManager.destroy();
    }
  }
}
