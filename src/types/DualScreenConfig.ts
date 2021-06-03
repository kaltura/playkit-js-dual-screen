import {Layout} from "../enums/layoutEnum";
import {Position} from "../enums/positionEnum";

export interface DualScreenConfig {
  inverse: boolean;
  layout: Layout;
  childSizePercentage: number;
  position: Position;
 // TEMPORARY
  secondaryEntryId: string;
}
