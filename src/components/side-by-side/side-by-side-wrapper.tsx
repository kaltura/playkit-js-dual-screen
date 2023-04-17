import {Component, h, VNode} from 'preact';
import {SideBySide} from './side-by-side';
import {Animations, Layout, StreamMode} from '../../enums';
import {OnClick} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import {ResponsiveManager} from '../responsive-manager';
import * as styles from './side-by-side.scss';

interface SideProps {
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  onExpand: OnClick;
  focusOnButton?: boolean;
  multiscreen: VNode;
  animation: Animations;
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
          <SideBySide {...leftSideProps} streamMode={layout === Layout.SideBySide ? StreamMode.Primary : StreamMode.Secondary} />
          <SideBySide {...rightSideProps} streamMode={layout === Layout.SideBySide ? StreamMode.Secondary : StreamMode.Primary} />
        </div>
      </ResponsiveManager>
    );
  }
}
