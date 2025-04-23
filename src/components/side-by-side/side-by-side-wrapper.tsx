import {Component, h, VNode, createRef} from 'preact';
import {SideBySide} from './side-by-side';
import {Animations, Layout, StreamMode, DUAL_SCREEN_CLASSNAME} from '../../enums';
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
  sbsWrapperRef = createRef<HTMLDivElement>();

  render({leftSideProps, rightSideProps, layout, onSizeChange, onMinSize}: SideBySideWrapperComponentProps) {
    return (
      <ResponsiveManager
        onMinSize={() => {
          onMinSize();
        }}
        onDefaultSize={onSizeChange}>
        <div
          className={[DUAL_SCREEN_CLASSNAME, styles.sideBySideWrapper].join(' ')}
          ref={this.sbsWrapperRef}
          data-testid="dualscreen_sideBySideWrapper">
          <SideBySide
            {...leftSideProps}
            streamMode={layout === Layout.SideBySide ? StreamMode.Primary : StreamMode.Secondary}
            getParentRef={() => this.sbsWrapperRef}
          />
          <SideBySide
            {...rightSideProps}
            streamMode={layout === Layout.SideBySide ? StreamMode.Secondary : StreamMode.Primary}
            getParentRef={() => this.sbsWrapperRef}
          />
        </div>
      </ResponsiveManager>
    );
  }
}
