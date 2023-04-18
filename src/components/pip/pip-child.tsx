import {h, createRef, Component, Fragment, VNode} from 'preact';
import * as styles from './pip.scss';
import {Animations, ButtonsEnum, Layout} from '../../enums';
import {icons} from '../../icons';
import {Button, ButtonSize, ButtonType} from '@playkit-js/common/dist/components/button';
import {OnClick} from '@playkit-js/common/dist/hoc/a11y-wrapper';
const {connect} = KalturaPlayer.ui.redux;
const {utils, reducers} = KalturaPlayer.ui;
const {Icon} = KalturaPlayer.ui.components;
const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = ({layout}: PIPChildComponentOwnProps) => {
  return {
    sideBySide: <Text id="dualScreen.side_by_side">Side by side screens</Text>,
    switchScreen:
      layout === Layout.PIP ? (
        <Text id="dualScreen.switch_to_secondary_screen">Switch to secondary screen</Text>
      ) : (
        <Text id="dualScreen.switch_to_primary_screen">Switch to primary screen</Text>
      ),
    hideLabel: <Text id="dualScreen.hide">Hide</Text>,
    hideAriaLabel: <Text id="dualScreen.hide_label">Hide dual screen</Text>
  };
};

const mapStateToProps = (state: Record<string, any>) => ({
  showUi: state.shell.playerHover || state.shell.playerNav,
  playerHeight: state.shell.guiClientRect.height,
  prePlayback: state.engine.prePlayback
});

interface PIPChildComponentOwnProps {
  multiscreen: VNode;
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  playerSizePercentage: number;
  hide: OnClick;
  onSideBySideSwitch: OnClick;
  onInversePIP: OnClick;
  animation: Animations;
  isDragging?: boolean;
  setDraggableTarget?: (targetEl: HTMLDivElement) => void;
  portrait?: boolean;
  aspectRatio: {
    width: number;
    height: number;
  };
  focusOnButton?: ButtonsEnum;
  layout: Layout;
}
interface PIPChildComponentConnectProps {
  playerHeight?: number;
  showUi?: boolean;
  prePlayback?: boolean;
}
interface PIPChildComponentTranslates {
  sideBySide?: string;
  switchScreen?: string;
  hideLabel?: string;
  hideAriaLabel?: string;
}

type PIPChildComponentProps = PIPChildComponentOwnProps & PIPChildComponentConnectProps & PIPChildComponentTranslates;

@withText(translates)
@connect(mapStateToProps, utils.bindActions(reducers.shell.actions))
export class PipChild extends Component<PIPChildComponentProps> {
  playerContainerRef = createRef<HTMLDivElement>();
  pipContainerRef = createRef<HTMLDivElement>();

  componentDidMount() {
    const {player} = this.props;
    const videoElement = player.getVideoElement();
    videoElement.tabIndex = -1;
    this.playerContainerRef.current!.prepend(videoElement);
    this.props.setDraggableTarget!(this.playerContainerRef.current!);
  }

  private _renderInnerButtons() {
    const {onSideBySideSwitch, onInversePIP, focusOnButton, multiscreen} = this.props;
    return (
      <div className={[styles.innerButtons, this.props.portrait ? styles.verticalPlayer : ''].join(' ')}>
        <div className={styles.buttonWrapper}>{multiscreen}</div>
        <div className={styles.buttonWrapper}>
          <Button
            icon={'add'}
            onClick={onSideBySideSwitch}
            tooltip={{label: this.props.sideBySide!, type: 'bottom-left'}}
            type={ButtonType.borderless}
            size={ButtonSize.medium}
            focusOnMount={focusOnButton === ButtonsEnum.SideBySide}
          />
        </div>
        <div className={styles.buttonWrapper}>
          <Button
            onClick={onInversePIP}
            tooltip={{label: this.props.switchScreen!, type: 'bottom-left'}}
            focusOnMount={focusOnButton === ButtonsEnum.SwitchScreen}
            type={ButtonType.borderless}
            size={ButtonSize.medium}
            icon={'switch'}
          />
        </div>
      </div>
    );
  }

  private _renderHideButton() {
    const {hide, focusOnButton} = this.props;
    return (
      <Button
        className={styles.hideContainer}
        onClick={hide}
        ariaLabel={this.props.hideAriaLabel}
        focusOnMount={focusOnButton === ButtonsEnum.Hide}
        type={ButtonType.translucent}>
        <Fragment>
          <div className={styles.iconContainer}>
            <Icon
              id="dualscreen-pip-hide"
              height={icons.SmallSize}
              width={icons.SmallSize}
              viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`}
              path={icons.HIDE_ICON_PATH}
            />
          </div>
          {this.props.hideLabel}
        </Fragment>
      </Button>
    );
  }

  render(props: PIPChildComponentProps) {
    const styleClass = [styles.childPlayer];

    if (props.isDragging) {
      styleClass.push(styles.dragging);
    }
    if (!props.showUi) {
      styleClass.push(styles.hideButtons);
    }

    if (!props.prePlayback && props.animation) {
      switch (props.animation) {
        case Animations.Fade:
          styleClass.push(styles.animatedFade);
          break;
        case Animations.ScaleRight:
          styleClass.push(styles.animatedScaleRight);
          break;
        case Animations.ScaleLeft:
          styleClass.push(styles.animatedScaleLeft);
          break;
      }
    }

    const height: number = (props.playerHeight! * props.playerSizePercentage) / 100;
    const width: number = (height * props.aspectRatio.width) / props.aspectRatio.height;
    const playerContainerStyles = {
      height: `${props.portrait ? width : height}px`
    };

    return (
      <div className={styleClass.join(' ')} ref={this.pipContainerRef}>
        {this._renderHideButton()}
        <div className={styles.playerWrapper}>
          <div className={styles.playerContainer} style={playerContainerStyles} ref={this.playerContainerRef} />
          {this._renderInnerButtons()}
        </div>
      </div>
    );
  }
}
