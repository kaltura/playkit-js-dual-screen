import {h, createRef, Component} from 'preact';
import * as styles from './pip.scss';
import {Position} from '../../enums/positionEnum';
import {icons} from "../../icons";
const {connect} = KalturaPlayer.ui.redux;
const {utils, reducers} = KalturaPlayer.ui;
const {Icon} = KalturaPlayer.ui.components;

const mapStateToProps = (state: any) => ({
  playerHover: state.shell.playerHover,
  guiClientRect: state.shell.guiClientRect
});

interface PIPComponentProps {
  childPlayer: any;
  childSizePercentage?: number;
  inverse?: boolean;
  position: Position;
  hide: Function;
}
@connect(mapStateToProps, utils.bindActions(reducers.shell.actions))
export class Pip extends Component<PIPComponentProps> {
  ref = createRef();

  componentDidMount() {
    this.ref.current.appendChild(this.props.childPlayer.getView());
  }

  render(props: any) {
    let styleClass = props.inverse ? [] : [styles.childPlayer];
    if (props.playerHover) {
      styleClass.push(styles.hover);
    }
    const height: number = props.inverse ? props.guiClientRect.height : (props.guiClientRect.height * props.childSizePercentage) / 100;
    const width: number = height * 16 / 9;
    switch (props.position) {
      case Position.BottomRight:
        styleClass.push(styles.bottom);
        styleClass.push(styles.right);
        break;
      default:
    }
    return (
      <div className={styleClass.join(' ')}>
        <div className={styles.videoContainer} style={`height: ${height + 'px'}; width: ${width + 'px'}`} ref={this.ref} />
        {props.playerHover ? this._renderHoverButton(props) : ''}
      </div>
    );
  }

  private _renderHoverButton(props: PIPComponentProps) {
    return (
      <div>
        <div className={styles.innerButtons}>
          <div className={styles.iconContainer}>
            <Icon id="dualscreen-pip-swap" height={24} width={24} path={icons.SWAP_ICON_PATH} />
          </div>
          <div className={styles.iconContainer}>
            <Icon id="dualscreen-pip-side-by-side" height={24} width={24} path={icons.SIDE_BY_SIDE_ICON_PATH} />
          </div>
        </div>
        <div
          onMouseUp={() => {
            props.hide();
          }}
          role="button"
          className={styles.hideContainer}>
          <div className={styles.iconContainer}>
            <Icon id="dualscreen-pip-hide" height={16} width={16} path={icons.HIDE_ICON_PATH} />
          </div>
          Hide
        </div>
      </div>
    );
  }
}
