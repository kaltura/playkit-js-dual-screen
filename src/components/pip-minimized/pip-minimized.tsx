import {h, createRef, Component, Fragment} from 'preact';
import * as styles from './pip-minimized.scss';
import {icons} from '../../icons';
import {Button} from './../button';
import {Labels} from '../../enums';
const {
  components: {Icon}
} = KalturaPlayer.ui;

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
          <Button onClick={show} className={styles.showContainer}>
            <Fragment>
              <div className={styles.iconContainer}>
                <Icon id="dualscreen-pip-minimized-show" height={icons.SmallSize} width={icons.SmallSize} path={icons.SHOW_ICON_PATH} />
              </div>
              {Labels.Show}
            </Fragment>
          </Button>
        )}
        <Button onClick={onInverse} className={[styles.innerButtons, hideButtons ? styles.tinyInnerButtons : ''].join(' ')}>
          <div className={styles.iconContainer}>
            <Icon id="dualscreen-pip-minimized-swap" height={icons.MediumSize} width={icons.MediumSize} path={icons.SWAP_ICON_PATH} />
          </div>
        </Button>
      </Fragment>
    );
  };

  render(props: PIPMinimizedProps) {
    return (
      <div className={styles.childPlayerContainer}>
        <div ref={this.ref} className={[styles.childPlayer, props.hideButtons ? styles.tinyChildPlayer : ''].join(' ')} />
        {this._renderHoverButton()}
      </div>
    );
  }
}
