import {DualScreenConfig} from './types/DualScreenConfig';
import {Mode} from './enums/modeEnum';
import {ReservedPresetAreas} from './enums/reservedPresetAreasEnum';
import {h} from 'preact';
import {Pip} from './components/pip';
import {PipMinimized} from './components/pip-minimized';
import {SideBySide} from 'components/side-by-side';

export class DualScreen extends KalturaPlayer.core.BasePlugin {
  private _player: any;
  private _secondaryKalturaPlayer: any;
  private _mode: Mode = Mode.PIP;
  private _removeActivesArr: Function[] = [];

  /**
   * The default configuration of the plugin.
   * @type {VisibilityConfigObject}
   * @static
   */
  static defaultConfig: DualScreenConfig = {
    mode: Mode.PIP,
    secondarySizePercentage: 25
  };

  constructor(name: string, player: any, config: Object) {
    super(name, player, config);
    this._player = player;
    this._createDummyChildPlayer();
    this._initMode();
  }

  private _initMode() {
    this._mode = this.config.mode;
    switch (this._mode) {
      case Mode.PIP:
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
    this._removeActives();
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        // replaceComponent: 'LiveTag',
        container: ReservedPresetAreas.InteractiveArea,
        get: () => <Pip percentage={this.config.secondarySizePercentage} childPlayer={this._secondaryKalturaPlayer} />
      })
    );
  }

  private switchToPIPInverse() {
    this._removeActives();
    this._removeActivesArr.push(
      this._player.ui.addComponent({
        label: 'kaltura-dual-screen-pip',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        // replaceComponent: 'LiveTag',
        container: ReservedPresetAreas.VideoContainer,
        get: () => <Pip percentage={this.config.secondarySizePercentage} inverse childPlayer={this._secondaryKalturaPlayer} />
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
        // replaceComponent: 'LiveTag',
        container: ReservedPresetAreas.InteractiveArea,
        get: () => <Pip percentage={this.config.secondarySizePercentage} childPlayer={this._player} />
      })
    );
  }

  public switchToPIPMinimized() {
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
  public switchToSideBySide() {
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
}
