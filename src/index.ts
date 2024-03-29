/// <reference path="./global.d.ts" />

import {DualScreen} from './dualscreen';
import {DualscreenEvents} from './events';

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {DualScreen as Plugin};
export {VERSION, NAME};
export {DualscreenEvents};

const pluginName: string = 'dualscreen';
KalturaPlayer.core.registerPlugin(pluginName, DualScreen);
