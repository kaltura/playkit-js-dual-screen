import {ImagePlayer} from '../image-player';
import {KalturaPlayer} from 'kaltura-player-js';
import {PlayerType, PlayerContainers} from '../enums';

export interface DualScreenPlayer {
  id: string;
  type: PlayerType;
  container: PlayerContainers;
  player: KalturaPlayer | ImagePlayer;
}

export interface MultiscreenPlayer {
  player: KalturaPlayer | ImagePlayer;
  setSecondary: (() => void) | null;
  setPrimary: () => void;
}