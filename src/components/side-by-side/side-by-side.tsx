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
}

type SideBySideComponentProps = SideBySideComponentOwnProps & SideBySideComponentConnectProps;

const mapStateToProps = (state: Record<string, any>) => ({
  guiClientRect: state.shell.guiClientRect
});
@connect(mapStateToProps)
export class SideBySide extends Component<SideBySideComponentProps> {
  ref = createRef();

  componentDidMount() {
    this.ref.current.appendChild(this.props.secondaryPlayer.getView());
  }

  render({guiClientRect, onPIPSwitch}: SideBySideComponentProps) {
    const playerContainerStyles = {
      height: (guiClientRect?.width! / 2 / 16) * 9
    };
    return (
      <div ref={this.ref} className={styles.secondaryPlayer} style={playerContainerStyles}>
        <div className={styles.innerButtons}>
          <div className={styles.iconContainer} onMouseUp={onPIPSwitch}>
            <Icon id="dualscreen-side-by-side-pip" height={24} width={24} path={icons.SWITCH_TO_SIDE_BY_SIDE_ICON_PATH} />
          </div>
        </div>
      </div>
    );
  }
}
