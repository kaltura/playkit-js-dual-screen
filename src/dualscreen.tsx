import {DualScreenConfig} from './types/DualScreenConfig';
import {ReservedPresetAreas} from './enums/reservedPresetAreasEnum';
import {Layout} from './enums/layoutEnum';
import {h} from 'preact';
import {Pip} from './components/pip';
import {PipMinimized} from './components/pip-minimized';
import {SideBySide} from './components/side-by-side';
import {Position} from './enums/positionEnum';
import {VideoSyncManager} from './videoSyncManager';
import {ResponsiveManager} from './components/responsive-manager';
import {DragAndSnapManager} from "./dragAndSnapManager";

export class DualScreen extends KalturaPlayer.core.BasePlugin {
  private _player: KalturaPlayerTypes.Player;
  private _secondaryKalturaPlayer: KalturaPlayerTypes.Player;
  private _layout: Layout = Layout.PIP;
  private _inverse = false;
  private _pipPosition: Position = Position.BottomRight;
  private _removeActivesArr: Function[] = [];
  private _videoSyncManager: VideoSyncManager;
  private _dragAndSnapManager: DragAndSnapManager;

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
    this._secondaryKalturaPlayer = this._createDummyChildPlayer();
    this._secondaryKalturaPlayer.loadMedia({entryId: '0_4rvdnj48'});
    this._layout = this.config.layout;
    this._inverse = this.config.inverse;
    this._pipPosition = this.config.position;
    this._setMode();
    this._videoSyncManager = new VideoSyncManager(this.eventManager, player, this._secondaryKalturaPlayer, this.logger);
    this._dragAndSnapManager = new DragAndSnapManager(this.eventManager, this.logger, this._setPipPosition);
  }

  private _addBindings() {
    this.eventManager.listen(this.player, this.player.Event.RESIZE, (e: any) => {
      this.logger.debug(e);
    });
  }

  private _setMode = () => {
    if (this._layout === Layout.PIP) {
      this._inverse ? this._switchToPIPInverse() : this._switchToPIP();
      return;
    }
    if (this._layout === Layout.PIPMinimized) {
      this._switchToPIPMinimized();
      return;
    }
    this._switchToSideBySide();
  };

  private _removeActives() {
    this._removeActivesArr.forEach(value => {
      value();
    });
    this._removeActivesArr = [];
  }

  private _setPipPosition = (position: Position) => {
    this._pipPosition = position;
  }

  private _switchToPIP = (manualChange: boolean = true) => {
    if (manualChange) {
      this._layout = Layout.PIP;
      this._inverse = false;
    }
    this._removeActives();
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => (
          <Pip
            hide={this._switchToPIPMinimized}
            childSizePercentage={this.config.childSizePercentage}
            inverse
            childPlayer={this._player}
            position={this._pipPosition}
          />
        )
      })
    );
    const origPlayerParent: HTMLElement = this._player.getView().parentElement!;
    this._removeActivesArr.push(() => {
      origPlayerParent.appendChild(this._player.getView());
    });
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.InteractiveArea,
        get: () => (
          <ResponsiveManager
            onMinSize={() => {
              this._switchToPIPMinimized(false);
            }}
            onDefaultSize={this._setMode}>
            <Pip
              dragAndSnapManager={this._dragAndSnapManager}
              childSizePercentage={this.config.childSizePercentage}
              childPlayer={this._secondaryKalturaPlayer}
              position={this._pipPosition}
              hide={this._switchToPIPMinimized}
              onSideBySideSwitch={this._switchToSideBySide}
              onInversePIP={this._switchToPIPInverse}
            />
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToPIPInverse = (manualChange: boolean = true) => {
    if (manualChange) {
      this._layout = Layout.PIP;
      this._inverse = true;
    }
    this._removeActives();

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => (
          <Pip
            hide={this._switchToPIPMinimizedInverse}
            childSizePercentage={this.config.childSizePercentage}
            inverse
            childPlayer={this._secondaryKalturaPlayer}
            position={this._pipPosition}
          />
        )
      })
    );
    const origPlayerParent: HTMLElement = this._player.getView().parentElement!;
    this._removeActivesArr.push(() => {
      origPlayerParent.appendChild(this._player.getView());
    });
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.InteractiveArea,
        get: () => (
          <ResponsiveManager
            onMinSize={() => {
              this._switchToPIPMinimizedInverse(false);
            }}
            onDefaultSize={this._setMode}>
            <Pip
              dragAndSnapManager={this._dragAndSnapManager}
              childSizePercentage={this.config.childSizePercentage}
              childPlayer={this._player}
              position={this._pipPosition}
              hide={this._switchToPIPMinimizedInverse}
              onSideBySideSwitch={this._switchToSideBySide}
              onInversePIP={this._switchToPIP}
            />
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToPIPMinimized = (manualChange: boolean = true) => {
    if (manualChange) {
      this._layout = Layout.PIPMinimized;
      this._inverse = false;
    }
    this._removeActives();
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => (
          <Pip
            hide={this._switchToPIPMinimized}
            childSizePercentage={this.config.childSizePercentage}
            inverse
            childPlayer={this._player}
            position={this._pipPosition}
          />
        )
      })
    );
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip-minimized',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.BottomBar,
        get: () => (
          <ResponsiveManager
            onMinSize={() => {
              this._switchToPIPMinimized(false);
            }}
            onDefaultSize={this._setMode}>
            <PipMinimized show={this._switchToPIP} childPlayer={this._secondaryKalturaPlayer} onInverse={this._switchToPIPMinimizedInverse} />
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToPIPMinimizedInverse = (manualChange: boolean = true) => {
    if (manualChange) {
      this._layout = Layout.PIPMinimized;
      this._inverse = true;
    }
    this._removeActives();

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => (
          <Pip
            hide={this._switchToPIPMinimizedInverse}
            childSizePercentage={this.config.childSizePercentage}
            inverse
            childPlayer={this._secondaryKalturaPlayer}
            position={this._pipPosition}
          />
        )
      })
    );
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip-minimized',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.BottomBar,
        get: () => (
          <ResponsiveManager
            onMinSize={() => {
              this._switchToPIPMinimizedInverse(false);
            }}
            onDefaultSize={this._setMode}>
            <PipMinimized show={this._switchToPIPInverse} childPlayer={this._player} onInverse={this._switchToPIPMinimized} />
          </ResponsiveManager>
        )
      })
    );
  };

  private _switchToSideBySide = (manualChange: boolean = true) => {
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
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => <SideBySide secondaryPlayer={this._player} onPIPSwitch={this._switchToPIP} animated/>
      })
    );
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-side-by-side',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => (
          <ResponsiveManager
            onMinSize={() => {
              this._switchToPIPMinimized(false);
            }}
            onDefaultSize={this._setMode}>
            <SideBySide secondaryPlayer={this._secondaryKalturaPlayer} onPIPSwitch={this._switchToPIPInverse}/>
          </ResponsiveManager>
        )
      })
    );
  };

  private _createDummyChildPlayer() {
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
        partnerId: 811441,
      },
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
    this._videoSyncManager.destroy();
    this._dragAndSnapManager.destroy();
  }
}
