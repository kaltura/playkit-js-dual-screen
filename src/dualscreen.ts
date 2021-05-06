import {DualScreenConfig} from './types/DualScreenConfig';
import {Mode} from './enums/modeEnum';

export class DualScreen extends KalturaPlayer.core.BasePlugin {
  private _player: any;
  private _secondaryKalturaPlayer: any;


  /**
   * The default configuration of the plugin.
   * @type {VisibilityConfigObject}
   * @static
   */
  static defaultConfig: DualScreenConfig = {
    mode: Mode.PIP
  };

  constructor(name: string, player: any, config: Object) {
    super(name, player, config);
    this._player = player;
    this.createDummyChildPlayer();

  }

  private createDummyChildPlayer() {
    let childPlaceholder = document.createElement('div');
    childPlaceholder.setAttribute('id', 'childPlaceholder');
    childPlaceholder.style.width = '240px';
    childPlaceholder.style.height = '135px';
    document.body.appendChild(childPlaceholder);
    const childPlayerConfig = {
      targetId: 'childPlaceholder',
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
