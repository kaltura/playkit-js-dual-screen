import {Layout} from "../enums/layoutEnum";
import {Position} from "../enums/positionEnum";

export interface DualScreenConfig {
  layout: Layout;
  childSizePercentage: number;
  position: Position;
}
