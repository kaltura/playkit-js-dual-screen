import { DualScreen } from "./dualscreen";

declare global {
  const KalturaPlayer: {
    ui: {
      EventType: Record<string, string>;
      redux: {
        connect: (...args: any) => any;
      };
      reducers: Record<string, {actions: Record<string, unknown>[]}>;
      createPortal: (children: any, domElement: HTMLElement) => void;
      utils: {
        getLogger: (name: string) => KalturaPlayerTypes.Logger;
        bindActions(actions: Record<string, unknown>[]): (...args: any) => void;
      };
      components: {
        withPlayer: any;
        Tooltip: any;
      };
      preactHooks: any;
      preacti18n: any;
    };
    core: {
      EventType: Record<string, string>;
      registerPlugin(name: string, component: any): void;
      BasePlugin: {
        new (...args: any[]): KalturaPlayerTypes.BasePlugin;
      };
      BaseMiddleware: {
        new (): KalturaPlayerTypes.BaseMiddleware;
      };
      utils: {
        Object: {
          mergeDeep(
            target: Record<string, any>,
            ...sources: Record<string, any>[]
          );
        };
      };
    };
    getPlayer(targetId?: string): any;
    setup(options: any): KalturaPlayer;
  };
}
