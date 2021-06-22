import {h, createRef, Component, Fragment} from 'preact';
import * as styles from './pip.scss';
import {Animations, Labels} from '../../enums';
import {icons} from '../../icons';
import {GuiClientRect} from '../../types';
import {Button} from './../button';
const {connect} = KalturaPlayer.ui.redux;
const {utils, reducers} = KalturaPlayer.ui;
const {Icon} = KalturaPlayer.ui.components;

const mapStateToProps = (state: Record<string, any>) => ({
  playerHover: state.shell.playerHover,
  guiClientRect: state.shell.guiClientRect,
  prePlayback: state.engine.prePlayback
});

interface PIPChildComponentOwnProps {
  player: KalturaPlayerTypes.Player;
  playerSizePercentage: number;
  hide: () => void;
  onSideBySideSwitch: () => void;
  onInversePIP: () => void;
  animation: Animations;
  isDragging?: boolean;
}
interface PIPChildComponentConnectProps {
  guiClientRect?: GuiClientRect;
  playerHover?: boolean;
  prePlayback?: boolean;
}

type PIPChildComponentProps = PIPChildComponentOwnProps & PIPChildComponentConnectProps;
@connect(mapStateToProps, utils.bindActions(reducers.shell.actions))
export class PipChild extends Component<PIPChildComponentProps> {
  playerContainerRef = createRef<HTMLDivElement>();
  pipContainerRef = createRef<HTMLDivElement>();

  componentDidMount() {
    const {player} = this.props;
    this.playerContainerRef?.current?.appendChild(player.getView());
  }

  private _renderInnerButtons() {
    const {onSideBySideSwitch, onInversePIP} = this.props;
    return (
      <div className={styles.innerButtons}>
        <Button className={styles.iconContainer} onClick={onInversePIP} tooltip={{label: Labels.SwitchScreen, type: 'bottom-left'}}>
          <Icon id="dualscreen-pip-swap" height={icons.MediumSize} width={icons.MediumSize} path={icons.SWAP_ICON_PATH} />
        </Button>
        <Button className={styles.iconContainer} onClick={onSideBySideSwitch} tooltip={{label: Labels.SideBySide, type: 'bottom'}}>
          <Icon id="dualscreen-pip-side-by-side" height={icons.MediumSize} width={icons.MediumSize} path={icons.SIDE_BY_SIDE_ICON_PATH} />
        </Button>
      </div>
    );
  }

  private _renderHideButton() {
    return (
      <Button className={styles.hideContainer} onClick={this.props.hide}>
        <Fragment>
          <div className={styles.iconContainer}>
            <Icon id="dualscreen-pip-hide" height={icons.SmallSize} width={icons.SmallSize} path={icons.HIDE_ICON_PATH} />
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
    if (!props.playerHover) {
      styleClass.push(styles.hovering);
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

    const height: number = (props.guiClientRect!.height * props.playerSizePercentage) / 100;
    const width: number = (height * 16) / 9;
    const playerContainerStyles = {
      height: `${height + 'px'}`,
      width: `${width + 'px'}`
    };

    return (
      <div className={styleClass.join(' ')} ref={this.pipContainerRef}>
        {this._renderHideButton()}
        <div className={styles.playerContainer} style={playerContainerStyles} ref={this.playerContainerRef}>
          {this._renderInnerButtons()}
        </div>
      </div>
    );
  }
}
