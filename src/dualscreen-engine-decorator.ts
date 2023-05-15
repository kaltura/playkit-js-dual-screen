// @ts-ignore
import {core} from 'kaltura-player-js';
import {DualScreen} from './dualscreen';
import {PlayerType, PlayerContainers} from './enums';

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
      // @ts-ignore
      this._isActive = !!this.secondaryPlayer?.src;
    });
    plugin.eventManager.listen(plugin.player, EventType.SEEKED, () => {
      this._isActive = false;
    });
  }

  get active(): boolean {
    // @ts-ignore
    return this._isActive && !this.secondaryPlayer.ended;
  }

  get secondaryPlayer() {
    return this._plugin.getActiveDualScreenPlayer(PlayerContainers.secondary);
  }

  dispatchEvent(event: FakeEvent): boolean {
    if (event.type === EventType.SEEKED) {
      if (this.secondaryPlayer?.type === PlayerType.VIDEO)
        // @ts-ignore
        this._plugin.eventManager.listenOnce(secondaryPlayer.player, EventType.SEEKED, () => {
          this._dispatcher(event);
        });
      return true;
    }
    return this._dispatcher(event);
  }
}
