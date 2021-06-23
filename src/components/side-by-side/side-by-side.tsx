import {h, createRef, Component} from 'preact';
import * as styles from './side-by-side.scss';
import {icons} from '../../icons';
import {Button} from './../button';
import {Animations, Labels} from './../../enums';
const {Icon} = KalturaPlayer.ui.components;
const {connect} = KalturaPlayer.ui.redux;

interface SideBySideComponentOwnProps {
  secondaryPlayer: KalturaPlayerTypes.Player;
  onPIPSwitch: () => void;
  animation: Animations;
}
interface SideBySideComponentConnectProps {
  guiClientRect?: {width: number; height: number};
  playerHover?: boolean;
}

type SideBySideComponentProps = SideBySideComponentOwnProps & SideBySideComponentConnectProps;

const mapStateToProps = (state: Record<string, any>) => ({
  guiClientRect: state.shell.guiClientRect,
  playerHover: state.shell.playerHover
});
@connect(mapStateToProps)
export class SideBySide extends Component<SideBySideComponentProps> {
  ref = createRef();

  componentDidMount() {
    this.ref.current.appendChild(this.props.secondaryPlayer.getView());
  }

  private _renderHoverButton() {
    const {onPIPSwitch, playerHover} = this.props;
    if (!playerHover) {
      return null;
    }
    return (
      <div className={styles.innerButtons}>
        <Button className={styles.iconContainer} onClick={onPIPSwitch} tooltip={{label: Labels.ExpandScreen, type: 'bottom-left'}}>
          <Icon id="dualscreen-side-by-side-pip" height={icons.MediumSize} width={icons.MediumSize} viewBox={`0 0 ${icons.MediumSize} ${icons.MediumSize}`} path={icons.SWITCH_TO_SIDE_BY_SIDE_ICON_PATH} />
        </Button>
      </div>
    );
  }

  render({guiClientRect, animation}: SideBySideComponentProps) {
    const playerContainerStyles = {
      height: (guiClientRect?.width! / 2 / 16) * 9
    };
    const classNames = [styles.secondaryPlayer];
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
