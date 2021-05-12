import {DualScreenConfig} from './types/DualScreenConfig';
import {ReservedPresetAreas} from './enums/reservedPresetAreasEnum';
import {Layout} from './enums/layoutEnum';
import {h} from 'preact';
import {Pip} from './components/pip';
import {PipMinimized} from './components/pip-minimized';
import {SideBySide} from './components/side-by-side';
import {Position} from './enums/positionEnum';
import {VideoSyncManager} from './videoSyncManager';

export class DualScreen extends KalturaPlayer.core.BasePlugin {
  private _player: any;
  private _secondaryKalturaPlayer: any;
  private _layout: Layout = Layout.PIP;
  private _removeActivesArr: Function[] = [];
  private _videoSyncManager: VideoSyncManager;

  /**
   * The default configuration of the plugin.
   * @type {VisibilityConfigObject}
   * @static
   */
  static defaultConfig: DualScreenConfig = {
    layout: Layout.PIP,
    secondarySizePercentage: 25,
    position: Position.BottomRight
  };

  constructor(name: string, player: any, config: DualScreenConfig) {
    super(name, player, config);
    this._player = player;
    this._addBindings();
    this._createDummyChildPlayer();
    this._initMode();
    this._videoSyncManager = new VideoSyncManager(this.eventManager, player, this._secondaryKalturaPlayer, this.logger);
  }

  private _addBindings() {
    this.eventManager.listen(this.player, this.player.Event.RESIZE, (e: any) => {
      this.logger.debug(e);
    });
  }

  private _initMode() {
    const config: DualScreenConfig = this.config;
    this._layout = config.layout;
    switch (this._layout) {
      case Layout.PIP:
        this.switchToPIP();
    }
  }
  private _removeActives() {
    this._removeActivesArr.forEach(value => {
      value();
    });
    this._removeActivesArr = [];
  }
  private switchToPIP() {
    this._layout = Layout.PIP;
    this._removeActives();
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.InteractiveArea,
        get: () => (
          <Pip secondarySizePercentage={this.config.secondarySizePercentage} childPlayer={this._secondaryKalturaPlayer} position={this.config.position} />
        )
      })
    );
  }

  private _switchToPIPInverse() {
    this._layout = Layout.PIPInverse;
    this._removeActives();
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.InteractiveArea,
        get: () => <Pip secondarySizePercentage={this.config.secondarySizePercentage} childPlayer={this._player} position={this.config.position} />
      })
    );

    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => <Pip secondarySizePercentage={this.config.secondarySizePercentage} inverse childPlayer={this._secondaryKalturaPlayer} position={this.config.position} />
      })
    );
    const origPlayerParent: HTMLElement = this._player.getView().parentElement;
    this._removeActivesArr.push(() => {
      origPlayerParent.appendChild(this._player.getView());
    });
  }

  private _switchToPIPMinimized() {
    this._removeActives();
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip-minimized',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.BottomBarRightControls,
        get: () => <PipMinimized secondaryPlayer={this._secondaryKalturaPlayer} />
      })
    );
  }
  private _switchToSideBySide() {
    this._layout = Layout.SideBySide;
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
        get: () => <SideBySide secondaryPlayer={this._player} />
      })
    );
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-side-by-side',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: ReservedPresetAreas.VideoContainer,
        get: () => <SideBySide secondaryPlayer={this._secondaryKalturaPlayer} />
      })
    );
  }

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
