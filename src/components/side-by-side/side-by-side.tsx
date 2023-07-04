import {h, createRef, Component, VNode, Fragment, RefObject, cloneElement} from 'preact';
import * as styles from './side-by-side.scss';
import {Button, ButtonSize, ButtonType} from '@playkit-js/common/dist/components/button';
import {OnClick} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import {Animations, StreamMode} from './../../enums';
const {connect} = KalturaPlayer.ui.redux;
const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = ({streamMode}: SideBySideComponentOwnProps) => {
  return {
    expandScreen:
      streamMode === StreamMode.Primary ? (
        <Text id="dualScreen.expand_primary_screen">Expand primary screen</Text>
      ) : (
        <Text id="dualScreen.expand_secondary_screen">Expand secondary screen</Text>
      )
  };
};

interface SideBySideComponentOwnProps {
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  onExpand: OnClick;
  animation: Animations;
  focusOnButton?: boolean;
  streamMode: StreamMode;
  multiscreen: VNode;
  getParentRef: () => RefObject<HTMLDivElement>;
}
interface SideBySideComponentConnectProps {
  playerWidth?: number;
  showUi?: boolean;
}
interface SideBySideComponentTranslates {
  expandScreen?: string;
}

type SideBySideComponentProps = SideBySideComponentOwnProps & SideBySideComponentConnectProps & SideBySideComponentTranslates;

const mapStateToProps = (state: Record<string, any>) => ({
  playerWidth: state.shell.guiClientRect.width,
  showUi: state.shell.playerHover || state.shell.playerNav
});

@withText(translates)
@connect(mapStateToProps)
export class SideBySide extends Component<SideBySideComponentProps> {
  ref = createRef();

  componentDidMount() {
    const videoElement = this.props.player.getVideoElement();
    videoElement.tabIndex = -1;
    this.ref.current.prepend(videoElement);
  }

  private _renderHoverButton() {
    const {onExpand, showUi, focusOnButton, multiscreen} = this.props;
    const styleClass = [styles.innerButtons];
    if (!showUi) {
      styleClass.push(styles.hideButtons);
    }
    return (
      <Fragment>
        <div className={styleClass.join(' ')}>
          <div className={styles.buttonWrapper}>{cloneElement(multiscreen, {getParentRef: this.props.getParentRef, sbsLayout: true})}</div>
          <div className={styles.buttonWrapper}>
            <Button
              className={styles.iconContainer}
              onClick={onExpand}
              tooltip={{label: this.props.expandScreen!, type: 'bottom-left'}}
              focusOnMount={focusOnButton}
              type={ButtonType.borderless}
              size={ButtonSize.medium}
              icon={'expand'}
              testId="dualscreen_switchToPIP"
            />
          </div>
        </div>
      </Fragment>
    );
  }

  render({playerWidth, animation}: SideBySideComponentProps) {
    const playerContainerStyles = {
      height: (playerWidth! / 2 / 16) * 9
    };
    const classNames = [styles.player];
    if (animation === Animations.ScaleLeft) {
      classNames.push(styles.animatedScale);
    } else {
      classNames.push(styles.animatedFade);
    }
    return (
      <div ref={this.ref} className={classNames.join(' ')} style={playerContainerStyles} data-testid="dualscreen_sbs">
        {this._renderHoverButton()}
      </div>
    );
  }
}
