import {h, createRef, Component, Fragment} from 'preact';
import * as styles from './pip-minimized.scss';
import {icons} from '../../icons';
import {Button} from './../button';
import {Labels} from '../../enums';
const {
  components: {Icon}
} = KalturaPlayer.ui;

interface PIPMinimizedOwnProps {
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  show: (byKeyboard: boolean) => void;
  onInverse: (byKeyboard: boolean) => void;
  hideButtons?: boolean;
  focusOnMount?: Labels;
}
interface PIPMinimizedConnectProps {
  playerSize?: string;
}

type PIPMinimizedProps = PIPMinimizedOwnProps & PIPMinimizedConnectProps;

export class PipMinimized extends Component<PIPMinimizedProps> {
  ref = createRef();

  componentDidMount() {
    this.ref.current.appendChild(this.props.player.getVideoElement());
  }

  private _renderHoverButton = () => {
    const {show, onInverse, hideButtons, focusOnMount} = this.props;
    return (
      <Fragment>
        {!hideButtons && (
          <Button onClick={show} className={styles.showContainer} ariaLabel={Labels.Show} focusOnMount={focusOnMount === Labels.Show}>
            <Fragment>
              <div className={styles.iconContainer}>
                <Icon
                  id="dualscreen-pip-minimized-show"
                  height={icons.SmallSize}
                  width={icons.SmallSize}
                  viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`}
                  path={icons.SHOW_ICON_PATH}
                />
              </div>
              {Labels.Show}
            </Fragment>
          </Button>
        )}
        <div className={[styles.innerButtons, hideButtons ? styles.tinyInnerButtons : ''].join(' ')}>
          <Button onClick={onInverse} focusOnMount={focusOnMount === Labels.SwitchScreen}>
            <div className={styles.iconContainer}>
              <Icon
                id="dualscreen-pip-minimized-swap"
                height={icons.MediumSize}
                width={icons.MediumSize}
                viewBox={`0 0 ${icons.MediumSize} ${icons.MediumSize}`}
                path={icons.SWAP_ICON_PATH}
              />
            </div>
          </Button>
        </div>
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
