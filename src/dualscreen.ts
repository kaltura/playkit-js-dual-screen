export class DualScreen extends KalturaPlayer.core.BasePlugin {
  constructor(name: string, player: any, config: Object) {
    super(name, player, config);
    this.createDummyChildPlayer();
  }

  private createDummyChildPlayer() {
    let childPlaceholder = document.createElement('div');
    childPlaceholder.setAttribute('id', 'childPlaceholder');
    childPlaceholder.style.width = "240px";
    childPlaceholder.style.height = "135px";
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

    let kalturaPlayer = KalturaPlayer.setup(childPlayerConfig);
    kalturaPlayer.loadMedia({entryId: '0_wifqaipd'});
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
