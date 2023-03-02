import {Component, h} from 'preact';
import {SideBySide} from './side-by-side';
import {Animations, Layout, StreamMode} from '../../enums';
import {ResponsiveManager} from '../responsive-manager';
import * as styles from './side-by-side.scss';

interface SideProps {
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  onExpand: (byKeyboard: boolean) => void;
  focusOnButton?: boolean;
}

interface SideBySideWrapperComponentProps {
  leftSideProps: SideProps;
  rightSideProps: SideProps;
  layout: Layout;
  onSizeChange: () => void;
  onMinSize: () => void;
}
export class SideBySideWrapper extends Component<SideBySideWrapperComponentProps> {
  render({leftSideProps, rightSideProps, layout, onSizeChange, onMinSize}: SideBySideWrapperComponentProps) {
    return (
      <ResponsiveManager
        onMinSize={() => {
          onMinSize();
        }}
        onDefaultSize={onSizeChange}>
        <div className={styles.sideBySideWrapper}>
          <SideBySide {...leftSideProps} animation={Animations.ScaleLeft} streamMode={layout === Layout.SideBySide? StreamMode.Primary : StreamMode.Secondary}  />
          <SideBySide {...rightSideProps} animation={Animations.Fade} streamMode={layout === Layout.SideBySide? StreamMode.Secondary : StreamMode.Primary} />
        </div>
      </ResponsiveManager>
    );
  }
}
