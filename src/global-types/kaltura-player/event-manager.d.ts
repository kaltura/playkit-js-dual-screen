declare namespace KalturaPlayerTypes {
  export interface EventManager {
    listen: (player: KalturaPlayerTypes.Player, event: typeof EventType, cb: (...args: any) => void) => void;
    destroy: () => void;
  }
}
