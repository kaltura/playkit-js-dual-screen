import {h, createRef, Component} from 'preact';
import * as styles from './pip.scss';
import {Position} from '../../enums/positionEnum';
import {icons} from '../../icons';
import {DragAndSnapManager} from '../../dragAndSnapManager';
import {GuiClientRect} from '../../types';
const {connect} = KalturaPlayer.ui.redux;
const {utils, reducers} = KalturaPlayer.ui;
const {Icon} = KalturaPlayer.ui.components;

const mapStateToProps = (state: any) => ({
  playerHover: state.shell.playerHover,
  guiClientRect: state.shell.guiClientRect
});

interface PIPComponentOwnProps {
  childPlayer: KalturaPlayerTypes.Player;
  childSizePercentage: number;
  inverse?: boolean;
  position: Position;
  hide: () => void;
  onSideBySideSwitch?: () => void;
  onInversePIP?: () => void;
  dragAndSnapManager?: DragAndSnapManager;
}
interface PIPComponentConnectProps {
  guiClientRect?: GuiClientRect;
  playerHover?: boolean;
}
interface PIPComponentState {
  position: Position;
}
type PIPComponentProps = PIPComponentOwnProps & PIPComponentConnectProps;
@connect(mapStateToProps, utils.bindActions(reducers.shell.actions))
export class Pip extends Component<PIPComponentProps, PIPComponentState> {
  videoContainerRef = createRef<HTMLDivElement>();
  pipContainerRef = createRef<HTMLDivElement>();
  constructor(props: PIPComponentProps) {
    super(props);
    this.state = {
      position: props.position
    };
  }

  componentDidMount() {
    const {childPlayer, dragAndSnapManager} = this.props;
    this.videoContainerRef?.current?.appendChild(childPlayer.getView());
    if (dragAndSnapManager && this.pipContainerRef.current) {
      dragAndSnapManager.setDraggableContainer(this.pipContainerRef.current);
      dragAndSnapManager.onPositionChanged(this._onPositionChanged);
    }
  }

  componentDidUpdate() {
    const {dragAndSnapManager, guiClientRect} = this.props;
    if (dragAndSnapManager && guiClientRect) {
      dragAndSnapManager.setGuiClientRect(guiClientRect);
    }
  }

  private _renderHoverButton() {
    const {hide, onSideBySideSwitch, onInversePIP, inverse, playerHover} = this.props;
    if (!playerHover || inverse) {
      return null;
    }
    return (
      <div>
        <div className={styles.innerButtons}>
          <div className={styles.iconContainer} onMouseUp={onInversePIP}>
            <Icon id="dualscreen-pip-swap" height={24} width={24} path={icons.SWAP_ICON_PATH} />
          </div>
          <div className={styles.iconContainer} onMouseUp={onSideBySideSwitch}>
            <Icon id="dualscreen-pip-side-by-side" height={24} width={24} path={icons.SIDE_BY_SIDE_ICON_PATH} />
          </div>
        </div>
        <div onMouseUp={hide} role="button" className={styles.hideContainer}>
          <div className={styles.iconContainer}>
            <Icon id="dualscreen-pip-hide" height={16} width={16} path={icons.HIDE_ICON_PATH} />
          </div>
          Hide
        </div>
      </div>
    );
  }

  private _onPositionChanged = (position: Position) => {
    this.setState({
      position
    });
  };

  render(props: PIPComponentProps) {
    let styleClass = props.inverse ? [] : [styles.childPlayer];

    if (props.playerHover) {
      styleClass.push(styles.hover);
    }

    const pipContainerStyles: Record<string, number> = {};

    if (!props.inverse) {
      switch (this.state.position) {
        case Position.BottomRight:
          pipContainerStyles.bottom = 0;
          pipContainerStyles.right = 0;
          break;
        case Position.BottomLeft:
          pipContainerStyles.bottom = 0;
          pipContainerStyles.left = 0;
          break;
        case Position.TopRight:
          pipContainerStyles.top = 0;
          pipContainerStyles.right = 0;
          break;
        case Position.TopLeft:
          pipContainerStyles.top = 0;
          pipContainerStyles.left = 0;
      }
    }

    const height: number = props.inverse ? props.guiClientRect!.height : (props.guiClientRect!.height * props.childSizePercentage) / 100;
    const width: number = props.inverse ? props.guiClientRect!.width : (height * 16) / 9;
    const videoContainerStyles = {
      height: `${height + 'px'}`,
      width: `${width + 'px'}`
    };

    return (
      <div className={styleClass.join(' ')} ref={this.pipContainerRef} style={pipContainerStyles}>
        <div className={styles.videoContainer} style={videoContainerStyles} ref={this.videoContainerRef} />
        {this._renderHoverButton()}
      </div>
    );
  }
}
