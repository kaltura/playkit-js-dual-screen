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
  isDragging: boolean;
}
type PIPComponentProps = PIPComponentOwnProps & PIPComponentConnectProps;
@connect(mapStateToProps, utils.bindActions(reducers.shell.actions))
export class Pip extends Component<PIPComponentProps, PIPComponentState> {
  videoContainerRef = createRef<HTMLDivElement>();
  pipContainerRef = createRef<HTMLDivElement>();
  constructor(props: PIPComponentProps) {
    super(props);
    this.state = {
      isDragging: false
    };
  }

  componentDidMount() {
    const {childPlayer, dragAndSnapManager} = this.props;
    this.videoContainerRef?.current?.appendChild(childPlayer.getView());
    if (dragAndSnapManager && this.pipContainerRef.current) {
      dragAndSnapManager.setDraggableContainer(this.pipContainerRef.current);
      dragAndSnapManager.onStartDrag(this._onStartDrag);
      dragAndSnapManager.onStopDrag(this._onStopDrag);
    }
  }

  componentDidUpdate() {
    const {dragAndSnapManager, guiClientRect} = this.props;
    if (dragAndSnapManager && guiClientRect) {
      dragAndSnapManager.setGuiClientRect(guiClientRect);
    }
  }

  private _handleHide = (e: Event) => {
    e.stopPropagation();
    this.props.dragAndSnapManager?.destroy();
    this.props.hide();
  }

  private _renderHoverButton() {
    const {onSideBySideSwitch, onInversePIP, inverse, playerHover} = this.props;
    if (!playerHover || inverse || this.state.isDragging) {
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
        <div onMouseUp={this._handleHide} role="button" className={styles.hideContainer}>
          <div className={styles.iconContainer}>
            <Icon id="dualscreen-pip-hide" height={16} width={16} path={icons.HIDE_ICON_PATH} />
          </div>
          Hide
        </div>
      </div>
    );
  }

  private _onStartDrag = () => {
    this.setState({
      isDragging: true
    });
  };

  private _onStopDrag = () => {
    this.setState({
      isDragging: false
    });
  };

  render(props: PIPComponentProps) {
    let styleClass = props.inverse ? [] : [styles.childPlayer];

    if (props.playerHover) {
      styleClass.push(styles.playerHover);
    }

    if (this.state.isDragging) {
      styleClass.push(styles.dragging);
    }

    const pipContainerStyles: Record<string, number> = {};

    if (!props.inverse) {
      switch (props.position) {
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
