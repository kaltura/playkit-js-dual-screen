import {h, createRef, Component} from 'preact';
import * as styles from './side-by-side.scss';
import {icons} from '../../icons';
const {Icon} = KalturaPlayer.ui.components;
const {connect} = KalturaPlayer.ui.redux;

interface SideBySideComponentOwnProps {
  secondaryPlayer: KalturaPlayerTypes.Player;
  onPIPSwitch: () => void;
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
        <div className={styles.iconContainer} onMouseUp={onPIPSwitch}>
          <Icon id="dualscreen-side-by-side-pip" height={24} width={24} path={icons.SWITCH_TO_SIDE_BY_SIDE_ICON_PATH} />
        </div>
      </div>
    );
  }

  render({guiClientRect}: SideBySideComponentProps) {
    const playerContainerStyles = {
      height: (guiClientRect?.width! / 2 / 16) * 9
    };
    return (
      <div ref={this.ref} className={styles.secondaryPlayer} style={playerContainerStyles}>
        {this._renderHoverButton()}
      </div>
    );
  }
}
