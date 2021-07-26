import {h, Component} from 'preact';
import {SideBySide} from './side-by-side';
import {Animations} from '../../enums';
import {ResponsiveManager} from '../responsive-manager';
import * as styles from './side-by-side.scss';

interface SideBySideWrapperComponentProps {
  primaryPlayer: KalturaPlayerTypes.Player;
  secondaryPlayer: KalturaPlayerTypes.Player;
  switchToPIP: Function;
  switchToPIPMinimized: Function;
  switchToPIPInverse: Function;
  setMode: () => void;
  inverse: boolean;
}
export class SideBySideWrapper extends Component<SideBySideWrapperComponentProps> {
  render({primaryPlayer, secondaryPlayer, switchToPIP, switchToPIPMinimized, setMode, switchToPIPInverse, inverse}: SideBySideWrapperComponentProps) {
    const leftSideProps = {
      player: inverse ? secondaryPlayer : primaryPlayer,
      onExpand: inverse ? () => switchToPIPInverse(true, Animations.ScaleRight) : () => switchToPIP(true, Animations.ScaleRight),
      animation: Animations.ScaleLeft
    };
    const rightSideProps = {
      player: inverse ? primaryPlayer : secondaryPlayer,
      onExpand: inverse ? () => switchToPIP(true, Animations.ScaleLeft) : () => switchToPIPInverse(true, Animations.ScaleLeft),
      animation: Animations.Fade
    };
    return (
      <ResponsiveManager
        onMinSize={() => {
          switchToPIPMinimized(false);
        }}
        onDefaultSize={setMode}>
        <div className={styles.sideBySideWrapper}>
          <SideBySide {...leftSideProps} />
          <SideBySide {...rightSideProps} />
        </div>
      </ResponsiveManager>
    );
  }
}
