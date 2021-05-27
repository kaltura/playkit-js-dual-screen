import {h, createRef, Component} from 'preact';
import * as styles from './side-by-side.scss';
import {icons} from '../../icons';
const {Icon} = KalturaPlayer.ui.components;
const {connect} = KalturaPlayer.ui.redux;

interface SideBySideComponentOwnProps {
  secondaryPlayer: any;
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
        <div className={styles.toPipContainer} onMouseUp={onPIPSwitch}>
          <div className={styles.iconContainer}>
            <Icon id="dualscreen-side-by-side-pip" height={28} width={28} path={icons.SWITCH_TO_SIDE_BY_SIDE_ICON_PATH} />
          </div>
        </div>
      </div>
    );
  }
}
