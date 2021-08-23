import {h, Component} from 'preact';
import {SideBySide} from './side-by-side';
import {Animations} from '../../enums';
import {ResponsiveManager} from '../responsive-manager';
import * as styles from './side-by-side.scss';

interface SideBySideWrapperComponentProps {
  leftPlayer: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  rightPlayer: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  switchToPIP: Function;
  switchToPIPMinimized: Function;
  switchToPIPInverse: Function;
  onSizeChange: () => void;
  inverse: boolean;
}
export class SideBySideWrapper extends Component<SideBySideWrapperComponentProps> {
  render({leftPlayer, rightPlayer, switchToPIP, switchToPIPMinimized, onSizeChange, switchToPIPInverse, inverse}: SideBySideWrapperComponentProps) {
    const leftSideProps = {
      player: inverse ? rightPlayer : leftPlayer,
      onExpand: inverse ? () => switchToPIPInverse(true, Animations.ScaleRight) : () => switchToPIP(true, Animations.ScaleRight),
      animation: Animations.ScaleLeft
    };
    const rightSideProps = {
      player: inverse ? leftPlayer : rightPlayer,
      onExpand: inverse ? () => switchToPIP(true, Animations.ScaleLeft) : () => switchToPIPInverse(true, Animations.ScaleLeft),
      animation: Animations.Fade
    };
    return (
      <ResponsiveManager
        onMinSize={() => {
          switchToPIPMinimized(false);
        }}
        onDefaultSize={onSizeChange}>
        <div className={styles.sideBySideWrapper}>
          <SideBySide {...leftSideProps} />
          <SideBySide {...rightSideProps} />
        </div>
      </ResponsiveManager>
    );
  }
}
