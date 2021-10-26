import {Layout, Position, PlayerType} from '../enums';

export interface DualScreenConfig {
  inverse: boolean;
  layout: Layout;
  childSizePercentage: number;
  position: Position;
  childAspectRatio: {
    width: number;
    height: number;
  };
  slidesPreloadEnabled: boolean;
}
