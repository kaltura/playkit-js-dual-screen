import {h, createRef, Component} from 'preact';
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
}
export class SideBySideWrapper extends Component<SideBySideWrapperComponentProps> {
  render({primaryPlayer, secondaryPlayer, switchToPIP, switchToPIPMinimized, setMode, switchToPIPInverse}: SideBySideWrapperComponentProps) {
    return (
      <div className={styles.sideBySideWrapper}>
        <SideBySide player={primaryPlayer} onExpand={() => switchToPIP(true, Animations.ScaleRight)} animation={Animations.ScaleLeft} />
        <ResponsiveManager
          onMinSize={() => {
            switchToPIPMinimized(false);
          }}
          onDefaultSize={setMode}>
          <SideBySide player={secondaryPlayer} onExpand={() => switchToPIPInverse(true, Animations.ScaleLeft)} animation={Animations.Fade} />
        </ResponsiveManager>
      </div>
    );
  }
}
