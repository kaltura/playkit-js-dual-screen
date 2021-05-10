/// <reference path="./global-types/kaltura-player/kaltura-player.d.ts" />
/// <reference path="./global-types/kaltura-player/base-plugin.d.ts" />

declare module '*.scss' {
  const content: {[className: string]: string};
  export = content;
}
