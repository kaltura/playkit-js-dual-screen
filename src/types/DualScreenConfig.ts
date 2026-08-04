import {Layout, Position} from '../enums';
import {PluginsConfig} from './PluginsConfig';

export interface DualScreenConfig {
  layout: Layout;
  childSizePercentage: number;
  position: Position;
  childAspectRatio: {
    width: number;
    height: number;
  };
  plugins: PluginsConfig;
  slidesPreloadEnabled: boolean;
  removePlayerSettings: boolean;
}
