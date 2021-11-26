import {h, Component} from 'preact';
import {SideBySide} from './side-by-side';
import {Animations} from '../../enums';
import {ResponsiveManager} from '../responsive-manager';
import * as styles from './side-by-side.scss';

interface SideProps {
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  onExpand: (byKeyboard: boolean) => void;
  focusOnMount?: boolean;
}

interface SideBySideWrapperComponentProps {
  leftSideProps: SideProps;
  rightSideProps: SideProps;
  onSizeChange: () => void;
  onMinSize: () => void;
}
export class SideBySideWrapper extends Component<SideBySideWrapperComponentProps> {
  render({leftSideProps, rightSideProps, onSizeChange, onMinSize}: SideBySideWrapperComponentProps) {
    return (
      <ResponsiveManager
        onMinSize={() => {
          onMinSize();
        }}
        onDefaultSize={onSizeChange}>
        <div className={styles.sideBySideWrapper}>
          <SideBySide {...leftSideProps} animation={Animations.ScaleLeft} />
          <SideBySide {...rightSideProps} animation={Animations.Fade} />
        </div>
      </ResponsiveManager>
    );
  }
}
