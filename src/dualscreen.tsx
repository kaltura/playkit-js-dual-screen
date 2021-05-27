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

export class DualScreen extends KalturaPlayer.core.BasePlugin {
  private _player: any;
  private _secondaryKalturaPlayer: any;
  private _layout: Layout = Layout.PIP;
  private _inverse = false;
  private _removeActivesArr: Function[] = [];
  private _videoSyncManager: VideoSyncManager;

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
    this._createDummyChildPlayer();
    this._layout = this.config.layout;
    this._inverse = this.config.inverse;
    this._setMode();
    this._videoSyncManager = new VideoSyncManager(this.eventManager, player, this._secondaryKalturaPlayer, this.logger);
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
            position={this.config.position}
          />
        )
      })
    );
    const origPlayerParent: HTMLElement = this._player.getView().parentElement;
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
              childSizePercentage={this.config.childSizePercentage}
              childPlayer={this._secondaryKalturaPlayer}
              position={this.config.position}
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
            position={this.config.position}
          />
        )
      })
    );
    const origPlayerParent: HTMLElement = this._player.getView().parentElement;
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
              childSizePercentage={this.config.childSizePercentage}
              childPlayer={this._player}
              position={this.config.position}
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
            position={this.config.position}
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
            position={this.config.position}
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

    const origPlayerParent: HTMLElement = this._player.getView().parentElement;
    this._removeActivesArr.push(() => {
      origPlayerParent.appendChild(this._player.getView());
    });

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-side-by-side',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => <SideBySide secondaryPlayer={this._player} onPIPSwitch={this._switchToPIP}/>
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
        partnerId: 1091,
        env: {
          cdnUrl: 'https://qa-apache-php7.dev.kaltura.com/',
          serviceUrl: 'https://qa-apache-php7.dev.kaltura.com/api_v3'
        }
      },
      playback: {
        // options: {
        //   html5: {
        //     hls: {
        //     },
        //   }
        // }
      }
    };

    this._secondaryKalturaPlayer = KalturaPlayer.setup(childPlayerConfig);
    this._secondaryKalturaPlayer.loadMedia({entryId: '0_wifqaipd'});
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
  }
}
