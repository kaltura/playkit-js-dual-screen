import {Layout, Position} from '../enums';

export interface DualScreenConfig {
  layout: Layout;
  childSizePercentage: number;
  position: Position;
  childAspectRatio: {
    width: number;
    height: number;
  };
  slidesPreloadEnabled: boolean;
  removePlayerSettings: boolean;
}
