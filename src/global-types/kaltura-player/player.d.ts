interface FakeEvent {}

type CoreEventListener = (event: FakeEvent) => boolean | void;

declare namespace KalturaPlayerTypes {
  export interface Player {
    dimensions: {width: number; height: number};
    getActiveTracks(): {video: {width: number; height: number}};
    pause(): void;
    play(): void;
    isLive: () => boolean;
    isDvr: () => boolean;
    dispatchEvent(event: FakeEvent): boolean;
    seekToLiveEdge(): void;
    paused: boolean;
    isOnLiveEdge: () => boolean;
    getVideoElement(): HTMLVideoElement;
    addEventListener(type: string, listener: CoreEventListener): void;
    removeEventListener: (type: string, listener: CoreEventListener) => void;
    _detachMediaSource(): void;
    _attachMediaSource(): void;
    Event: Record<string, string>;
    currentTime: number;
    duration: number;
    ended: boolean;
    env: KalturaPlayerTypes.Env;
    configure: Function;
    config: KalturaPlayerTypes.PlayerConfig &
      DeepPartial<KalturaPlayerContribTypes.ContribConfig>;
  }
}
