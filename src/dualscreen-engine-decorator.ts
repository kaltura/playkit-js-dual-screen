// @ts-ignore
import {core} from '@playkit-js/kaltura-player-js';
import {DualScreen} from './dualscreen';

const {FakeEvent, EventType} = core;

// @ts-ignore
export class DualScreenEngineDecorator implements IEngineDecorator {
  private _plugin: DualScreen;
  private _isActive = false;
  private _dispatcher: Function;

  constructor(engine: any, plugin: DualScreen, dispatcher: Function) {
    this._plugin = plugin;
    this._dispatcher = dispatcher;

    plugin.eventManager.listen(plugin.player, EventType.SEEKING, () => {
      // activate decorator only if secondary entry is media, so decorator can handle SEEKED event from secondary player
      this._isActive = !!this._plugin.secondaryKalturaPlayer?.src;
    });
    plugin.eventManager.listen(plugin.player, EventType.SEEKED, () => {
      this._isActive = false;
    });
  }

  get active(): boolean {
    return this._isActive && !this._plugin.secondaryKalturaPlayer.ended;
  }

  dispatchEvent(event: FakeEvent): boolean {
    if (event.type === EventType.SEEKED) {
      this._plugin.eventManager.listenOnce(this._plugin.secondaryKalturaPlayer, EventType.SEEKED, () => {
        this._dispatcher(event);
      });
      return true;
    }
    return this._dispatcher(event);
  }
}
