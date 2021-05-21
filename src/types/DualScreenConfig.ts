import {Layout} from "../enums/layoutEnum";
import {Position} from "../enums/positionEnum";

export class DualScreenConfig {
  layout: Layout = Layout.PIP;
  childSizePercentage: number = 25;
  position: Position = Position.BottomRight;
}
