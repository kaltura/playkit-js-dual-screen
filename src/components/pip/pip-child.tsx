import {h, createRef, Component, Fragment} from 'preact';
import * as styles from './pip.scss';
import {Animations, Labels} from '../../enums';
import {icons} from '../../icons';
import {Button} from './../button';
const {connect} = KalturaPlayer.ui.redux;
const {utils, reducers} = KalturaPlayer.ui;
const {Icon} = KalturaPlayer.ui.components;

const mapStateToProps = (state: Record<string, any>) => ({
  showUi: state.shell.playerHover || state.shell.playerNav,
  playerHeight: state.shell.guiClientRect.height,
  prePlayback: state.engine.prePlayback
});

interface PIPChildComponentOwnProps {
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  playerSizePercentage: number;
  hide: (byKeyboard: boolean) => void;
  onSideBySideSwitch: (byKeyboard: boolean) => void;
  onInversePIP: (byKeyboard: boolean) => void;
  animation: Animations;
  isDragging?: boolean;
  setDraggableTarget?: (targetEl: HTMLDivElement) => void;
  portrait?: boolean;
  aspectRatio: {
    width: number;
    height: number;
  };
  focusOnMount?: Labels;
}
interface PIPChildComponentConnectProps {
  playerHeight?: number;
  showUi?: boolean;
  prePlayback?: boolean;
}

type PIPChildComponentProps = PIPChildComponentOwnProps & PIPChildComponentConnectProps;
@connect(mapStateToProps, utils.bindActions(reducers.shell.actions))
export class PipChild extends Component<PIPChildComponentProps> {
  playerContainerRef = createRef<HTMLDivElement>();
  pipContainerRef = createRef<HTMLDivElement>();

  componentDidMount() {
    const {player} = this.props;
    this.playerContainerRef.current!.prepend(player.getVideoElement());
    this.props.setDraggableTarget!(this.playerContainerRef.current!);
  }

  private _renderInnerButtons() {
    const {onSideBySideSwitch, onInversePIP, focusOnMount} = this.props;
    return (
      <div className={styles.innerButtons}>
        <Button
          className={styles.iconContainer}
          onClick={onSideBySideSwitch}
          tooltip={{label: Labels.SideBySide, type: 'bottom'}}
          focusOnMount={focusOnMount === Labels.SideBySide}>
          <Icon
            id="dualscreen-pip-side-by-side"
            height={icons.MediumSize}
            width={icons.MediumSize}
            viewBox={`0 0 ${icons.MediumSize} ${icons.MediumSize}`}
            path={icons.SIDE_BY_SIDE_ICON_PATH}
          />
        </Button>
        <Button
          className={styles.iconContainer}
          onClick={onInversePIP}
          tooltip={{label: Labels.SwitchScreen, type: 'bottom-left'}}
          focusOnMount={focusOnMount === Labels.SwitchScreen}>
          <Icon
            id="dualscreen-pip-swap"
            height={icons.MediumSize}
            width={icons.MediumSize}
            viewBox={`0 0 ${icons.MediumSize} ${icons.MediumSize}`}
            path={icons.SWAP_ICON_PATH}
          />
        </Button>
      </div>
    );
  }

  private _renderHideButton() {
    const {hide, focusOnMount} = this.props;
    return (
      <Button className={styles.hideContainer} onClick={hide} ariaLabel={Labels.Hide} focusOnMount={focusOnMount === Labels.Hide}>
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
          {Labels.Hide}
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
      height: `${props.portrait ? width : height}px`,
      width: `${props.portrait ? height : width}px`
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
