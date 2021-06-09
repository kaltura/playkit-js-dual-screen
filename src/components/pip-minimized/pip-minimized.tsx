import {h, createRef, Component, Fragment} from 'preact';
import * as styles from './pip-minimized.scss';
import {icons} from '../../icons';
const {
  redux: {connect},
  components: {PLAYER_SIZE, Icon}
} = KalturaPlayer.ui;

enum InteractiveAreaMargin {
  DEFAULT = '16px',
  SMALL = '8px'
}

interface PIPMinimizedOwnProps {
  childPlayer: KalturaPlayerTypes.Player;
  show: () => void;
  onInverse: () => void;
  hideButtons?: boolean;
}
interface PIPMinimizedConnectProps {
  playerSize?: string;
}

type PIPMinimizedProps = PIPMinimizedOwnProps & PIPMinimizedConnectProps;

const mapStateToProps = (state: Record<string, any>) => ({
  playerSize: state.shell.playerSize
});
@connect(mapStateToProps)
export class PipMinimized extends Component<PIPMinimizedProps> {
  ref = createRef();

  componentDidMount() {
    this.ref.current.appendChild(this.props.childPlayer.getView());
  }

  private _renderHoverButton = () => {
    const {show, onInverse, hideButtons} = this.props;
    return (
      <Fragment>
        {!hideButtons && (
          <div onMouseUp={show} role="button" className={styles.showContainer}>
            <div className={styles.iconContainer}>
              <Icon id="dualscreen-pip-minimized-show" height={16} width={16} path={icons.SHOW_ICON_PATH} />
            </div>
            Show
          </div>
        )}
        <div onMouseUp={onInverse} className={[styles.innerButtons, hideButtons ? styles.tinyInnerButtons : ''].join(' ')}>
          <div className={styles.iconContainer}>
            <Icon id="dualscreen-pip-minimized-swap" height={24} width={24} path={icons.SWAP_ICON_PATH} />
          </div>
        </div>
      </Fragment>
    );
  };

  render(props: PIPMinimizedProps) {
    return (
      <div
        className={styles.childPlayerContainer}
        style={{right: props.playerSize === PLAYER_SIZE.SMALL ? InteractiveAreaMargin.SMALL : InteractiveAreaMargin.DEFAULT}}>
        <div ref={this.ref} className={[styles.childPlayer, props.hideButtons ? styles.tinyChildPlayer : ''].join(' ')} />
        {this._renderHoverButton()}
      </div>
    );
  }
}
