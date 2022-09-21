import {h, createRef, Component} from 'preact';
import * as styles from './side-by-side.scss';
import {icons} from '../../icons';
import {Button} from './../button';
import {Animations, Labels} from './../../enums';
const {Icon} = KalturaPlayer.ui.components;
const {connect} = KalturaPlayer.ui.redux;

interface SideBySideComponentOwnProps {
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  onExpand: (byKeyboard: boolean) => void;
  animation: Animations;
  focusOnButton?: boolean;
}
interface SideBySideComponentConnectProps {
  playerWidth?: number;
  showUi?: boolean;
}

type SideBySideComponentProps = SideBySideComponentOwnProps & SideBySideComponentConnectProps;

const mapStateToProps = (state: Record<string, any>) => ({
  playerWidth: state.shell.guiClientRect.width,
  showUi: state.shell.playerHover || state.shell.playerNav
});
@connect(mapStateToProps)
export class SideBySide extends Component<SideBySideComponentProps> {
  ref = createRef();

  componentDidMount() {
    const videoElement = this.props.player.getVideoElement();
    videoElement.tabIndex = -1;
    this.ref.current.prepend(videoElement);
  }

  private _renderHoverButton() {
    const {onExpand, showUi, focusOnButton} = this.props;
    if (showUi) {
      return (
        <div className={styles.innerButtons}>
          <Button
            className={styles.iconContainer}
            onClick={onExpand}
            tooltip={{label: Labels.ExpandScreen, type: 'bottom-left'}}
            focusOnMount={focusOnButton}>
            <Icon
              id="dualscreen-side-by-side-pip"
              height={icons.MediumSize}
              width={icons.MediumSize}
              viewBox={`0 0 ${icons.MediumSize} ${icons.MediumSize}`}
              path={icons.SWITCH_TO_SIDE_BY_SIDE_ICON_PATH}
            />
          </Button>
        </div>
      );
    }
    return null;
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
      <div ref={this.ref} className={classNames.join(' ')} style={playerContainerStyles}>
        {this._renderHoverButton()}
      </div>
    );
  }
}
