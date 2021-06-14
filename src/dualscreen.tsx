import {DualScreenConfig} from './types/DualScreenConfig';
import {h} from 'preact';
import {PipChild, PipParent} from './components/pip';
import {PipMinimized} from './components/pip-minimized';
import {SideBySide} from './components/side-by-side';
import {Position, Animations, Layout, ReservedPresetAreas} from './enums';
import {VideoSyncManager} from './videoSyncManager';
import {ResponsiveManager} from './components/responsive-manager';
import {DragAndSnapManager} from './components/drag-and-snap-manager';

export class DualScreen extends KalturaPlayer.core.BasePlugin {
  private _player: KalturaPlayerTypes.Player;
  private _secondaryKalturaPlayer: KalturaPlayerTypes.Player;
  private _layout: Layout = Layout.PIP;
  private _inverse = false;
  private _pipPosition: Position = Position.BottomRight;
  private _removeActivesArr: Function[] = [];
  private _videoSyncManager?: VideoSyncManager;

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
    // TEMPORARY
    secondaryEntryId: "1_hwls7ruj"
  };

  constructor(name: string, player: any, config: DualScreenConfig) {
    super(name, player, config);
    this._player = player;
    this._addBindings();
    this._secondaryKalturaPlayer = this._createChildPlayer();
    this._layout = this.config.layout;
    this._inverse = this.config.inverse;
    this._pipPosition = this.config.position;
    this._setMode();
    this._videoSyncManager = new VideoSyncManager(this.eventManager, player, this._secondaryKalturaPlayer, this.logger);
  }

  loadMedia(): void {
    // this._getSecondaryMedia();
      this._secondaryKalturaPlayer.loadMedia({ entryId: this.config.secondaryEntryId });
      this._videoSyncManager = new VideoSyncManager(this.eventManager, this.player, this._secondaryKalturaPlayer, this.logger);
      this._setMode();
  }

  private _addBindings() {
    this.eventManager.listen(this.player, this.player.Event.RESIZE, (e: any) => {
      this.logger.debug(e);
    });
  }

  private _setMode = () => {
    if (this._layout === Layout.PIP) {
      this._inverse ? this._switchToPIPInverse(false) : this._switchToPIP(false);
      return;
    }
    if (this._layout === Layout.PIPMinimized) {
      this._switchToPIPMinimized(false);
      return;
    }
    this._switchToSideBySide(false);
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
    if (manualChange) {
      this._layout = Layout.PIP;
      this._inverse = false;
    }
    this._removeActives();
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Ads'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => <PipParent animation={parentAnimation} player={this._player} />
      })
    );
    const origPlayerParent: HTMLElement = this._player.getView().parentElement!;
    this._removeActivesArr.push(() => {
      origPlayerParent.appendChild(this._player.getView());
    });
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Ads'],
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
    if (manualChange) {
      this._layout = Layout.PIP;
      this._inverse = true;
    }
    this._removeActives();

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Ads'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => <PipParent animation={parentAnimation} player={this._secondaryKalturaPlayer} />
      })
    );
    const origPlayerParent: HTMLElement = this._player.getView().parentElement!;
    this._removeActivesArr.push(() => {
      origPlayerParent.appendChild(this._player.getView());
    });
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Ads'],
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
    if (manualChange) {
      this._layout = Layout.PIPMinimized;
      this._inverse = false;
    }
    this._removeActives();
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Ads'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => <PipParent animation={parentAnimation} player={this._player} />
      })
    );
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip-minimized',
        presets: ['Playback', 'Live', 'Ads'],
        container: ReservedPresetAreas.BottomBar,
        get: () => (
          <ResponsiveManager
            onMinSize={() => {
              this._switchToPIPMinimized(false);
            }}
            onDefaultSize={this._setMode}>
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
    if (manualChange) {
      this._layout = Layout.PIPMinimized;
      this._inverse = true;
    }
    this._removeActives();

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Ads'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => <PipParent animation={parentAnimation} player={this._secondaryKalturaPlayer} />
      })
    );
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip-minimized',
        presets: ['Playback', 'Live', 'Ads'],
        container: ReservedPresetAreas.BottomBar,
        get: () => (
          <ResponsiveManager
            onMinSize={() => {
              this._switchToPIPMinimizedInverse(false);
            }}
            onDefaultSize={this._setMode}>
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
    if (manualChange) {
      this._layout = Layout.SideBySide;
    }
    this._removeActives();

    const origPlayerParent: HTMLElement = this._player.getView().parentElement!;
    this._removeActivesArr.push(() => {
      origPlayerParent.appendChild(this._player.getView());
    });

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-side-by-side',
        presets: ['Playback', 'Live', 'Ads'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => (
          <SideBySide
            secondaryPlayer={this._player}
            onPIPSwitch={() => this._switchToPIP(true, Animations.ScaleRight)}
            animation={Animations.ScaleLeft}
          />
        )
      })
    );
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-side-by-side',
        presets: ['Playback', 'Live', 'Ads'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => (
          <ResponsiveManager
            onMinSize={() => {
              this._switchToPIPMinimized(false);
            }}
            onDefaultSize={this._setMode}>
            <SideBySide
              secondaryPlayer={this._secondaryKalturaPlayer}
              onPIPSwitch={() => this._switchToPIPInverse(true, Animations.ScaleLeft)}
              animation={Animations.Fade}
            />
          </ResponsiveManager>
        )
      })
    );
  };

  // private _getSecondaryMedia() {
  //   const headers: Map<string, string> = new Map();
  //   headers.set('Content-Type', 'application/json');
  //   const request = new RequestBuilder(headers);
  //   request.service = 'baseEntry';
  //   request.action = 'list';
  //   request.method = 'POST';
  //   request.tag = 'list';
  //   request.params = {
  //     filter: {objectType: 'KalturaBaseEntryFilter', parentEntryIdEqual: this._player.getMediaInfo().entryId},
  //     responseProfile: {
  //       type: ResponseProfileType.INCLUDE_FIELDS,
  //       fields: 'id'
  //     }
  //   };
  //   this._player.provider.getCustomData({requests: [request]}).then((response: any) => {
  //     this._secondaryKalturaPlayer.loadMedia({entryId: response[0].data.objects[0].id});
  //     this._setMode();
  //     this._videoSyncManager = new VideoSyncManager(this.eventManager, this.player, this._secondaryKalturaPlayer, this.logger);
  //   });
  // }

  private _createChildPlayer() {
    let childPlaceholder = document.createElement('div');
    childPlaceholder.setAttribute('id', 'childPlaceholder');
    childPlaceholder.style.width = '240px';
    childPlaceholder.style.height = '135px';
    childPlaceholder.hidden = true;
    document.body.appendChild(childPlaceholder);
    const childPlayerConfig = {
      targetId: 'childPlaceholder',
      ui: {
        disable: true
      },
      provider: {
        partnerId: this._player.config.provider.partnerId
      }
    };
    return KalturaPlayer.setup(childPlayerConfig);
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
