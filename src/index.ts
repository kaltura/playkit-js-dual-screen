/// <reference path="./global.d.ts" />

import {DualScreen} from './dualscreen';
import {DualscreenEvents} from './events';
import {registerPlugin} from '@playkit-js/kaltura-player-js';

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {DualScreen as Plugin};
export {VERSION, NAME};
export {DualscreenEvents};

const pluginName: string = 'dualscreen';
registerPlugin(pluginName, DualScreen as any);
