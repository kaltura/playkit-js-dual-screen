import {h, Component, cloneElement, VNode, createRef} from 'preact';
import {Position} from '../../enums/positionEnum';
import {getClientX, getClientY, dimensionStyleToString} from '../../utils';
import * as styles from './drag-and-snap-manager.scss';

const {
  redux: {connect}
} = KalturaPlayer.ui;

type OnPositionChangedCallback = (newPosition: Position) => void;
enum DragEvents {
  MouseDown = 'mousedown',
  MouseMove = 'mousemove',
  MouseUp = 'mouseup',

  TouchStart = 'touchstart',
  TouchMove = 'touchmove',
  TouchEnd = 'touchend'
}
const DRAG_THROTTLE_MS = 30;
const PRE_PLAYBACK_POSITION = -130;

interface DragAndSnapManagerOwnProps {
  children: VNode;
  onPositionChanged: OnPositionChangedCallback;
  getPosition: () => Position;
  eventManager: KalturaPlayerTypes.EventManager;
  logger: KalturaPlayerTypes.Logger;
}
interface DragAndSnapManagerConnectProps {
  prePlayback?: boolean;
}
type DragAndSnapManagerProps = DragAndSnapManagerOwnProps & DragAndSnapManagerConnectProps;
interface DragAndSnapManagerState {
  isDragging: boolean;
}

const mapStateToProps = (state: Record<string, any>) => ({
  prePlayback: state.engine.prePlayback
});
@connect(mapStateToProps)
export class DragAndSnapManager extends Component<DragAndSnapManagerProps, DragAndSnapManagerState> {
  private _draggableTargetRef = createRef<HTMLDivElement>();
  private _draggableItemRef = createRef<HTMLDivElement>();
  private _draggableAreaRef = createRef<HTMLDivElement>();
  private _currMousePos: {x: number; y: number} = {x: 0, y: 0};
  private _throttleWait: boolean = false;
  state = {
    isDragging: false
  };

  componentDidMount() {
    this._setRelativeStyles();
  }

  componentWillUnmount() {
    const {eventManager} = this.props;
    eventManager.unlisten(document, DragEvents.MouseMove);
    eventManager.unlisten(document, DragEvents.TouchMove);
    eventManager.unlisten(document, DragEvents.MouseUp);
    eventManager.unlisten(document, DragEvents.TouchEnd);
    eventManager.unlisten(this._draggableTargetRef.current!, DragEvents.MouseDown);
    eventManager.unlisten(this._draggableTargetRef.current!, DragEvents.TouchStart);
  }

  private _renderChildComponent = (): VNode => {
    const {children} = this.props;
    return cloneElement(children, {isDragging: this.state.isDragging, setDraggableTarget: this._setDraggableTarget});
  };

  private _setDraggableTarget = (targetEl: HTMLDivElement) => {
    this._draggableTargetRef.current = targetEl;
    this._addListeners();
  };

  private _handleChangePosition = (position: Position) => {
    this._setAbsoluteStyles(position);
    this.props.onPositionChanged(position);
  };

  private _onStartDrag = () => {
    this._setAbsoluteStyles(this.props.getPosition());
    this.setState({
      isDragging: true
    });
  };

  private _addListeners = () => {
    this.props.eventManager.listen(this._draggableTargetRef.current!, DragEvents.MouseDown, e => {
      this._startDrag(e, DragEvents.MouseMove, DragEvents.MouseUp);
    });
    this.props.eventManager.listen(this._draggableTargetRef.current!, DragEvents.TouchStart, e => {
      this.props.eventManager.unlisten(this._draggableTargetRef.current!, DragEvents.MouseDown);
      this._startDrag(e, DragEvents.TouchMove, DragEvents.TouchEnd);
    });
  };

  private _startDrag(e: MouseEvent | TouchEvent, moveEventName: string, endEventName: string) {
    this.props.eventManager.listenOnce(document, endEventName, this._stopDrag);

    // get the mouse cursor position at startup:
    this._currMousePos.x = getClientX(e);
    this._currMousePos.y = getClientY(e);

    this.props.eventManager.listenOnce(document, moveEventName, this._onStartDrag);
    this.props.eventManager.listen(document, moveEventName, this._moveDrag);
  }

  private _moveDrag = (e: MouseEvent | TouchEvent) => {
    if (this._throttleWait) {
      return;
    }
    e = e || window.event;
    // calculate the new cursor position:
    const deltaMousePosX = this._currMousePos.x - getClientX(e);
    const deltaMousePosY = this._currMousePos.y - getClientY(e);
    this._currMousePos.x = getClientX(e);
    this._currMousePos.y = getClientY(e);
    // set the element's new position
    if (this._draggableItemRef.current && this._draggableAreaRef.current) {
      let top = parseInt(this._draggableItemRef.current!.style.top, 10);
      let right = parseInt(this._draggableItemRef.current!.style.right, 10);
      this._draggableItemRef.current!.style.right = dimensionStyleToString(right + deltaMousePosX);
      this._draggableItemRef.current!.style.top = dimensionStyleToString(top - deltaMousePosY);
    }
    // handle throttling to avoid performance issues on dragging
    this._throttleWait = true;
    setTimeout(() => {
      this._throttleWait = false;
    }, DRAG_THROTTLE_MS);
  };

  private _getBoundingClientRects = (): [DOMRect, DOMRect] => {
    return [this._draggableItemRef.current!.getBoundingClientRect(), this._draggableAreaRef.current!.getBoundingClientRect()];
  };

  // relative styles: top, right, bottom, left
  private _applyRelativeStyles = (top: number | null, right: number | null, bottom: number | null, left: number | null) => {
    this._draggableItemRef.current!.style.top = top !== null ? dimensionStyleToString(top) : '';
    this._draggableItemRef.current!.style.right = right !== null ? dimensionStyleToString(right) : '';
    this._draggableItemRef.current!.style.bottom = bottom !== null ? dimensionStyleToString(bottom) : '';
    this._draggableItemRef.current!.style.left = left !== null ? dimensionStyleToString(left) : '';
  };
  private _setRelativeStyles = () => {
    switch (this.props.getPosition()) {
      case Position.BottomRight:
        this._setRelativeBottomRightStyles();
        break;
      case Position.BottomLeft:
        this._setRelativeBottomLeftStyles();
        break;
      case Position.TopRight:
        this._setRelativeTopRightStyles();
        break;
      case Position.TopLeft:
        this._setRelativeTopLeftStyles();
    }
  };
  private _setRelativeBottomRightStyles = () => {
    this._applyRelativeStyles(null, 0, this.props.prePlayback ? PRE_PLAYBACK_POSITION : 0, null);
  };
  private _setRelativeBottomLeftStyles = () => {
    this._applyRelativeStyles(null, null, this.props.prePlayback ? PRE_PLAYBACK_POSITION : 0, 0);
  };
  private _setRelativeTopRightStyles = () => {
    this._applyRelativeStyles(this.props.prePlayback ? PRE_PLAYBACK_POSITION : 0, 0, null, null);
  };
  private _setRelativeTopLeftStyles = () => {
    this._applyRelativeStyles(this.props.prePlayback ? PRE_PLAYBACK_POSITION : 0, null, null, 0);
  };

  // absolute styles: top, right
  private _applyAbsoluteStyles = (top: number, right: number) => {
    this._draggableItemRef.current!.style.top = dimensionStyleToString(top);
    this._draggableItemRef.current!.style.right = dimensionStyleToString(right);
  };
  private _setAbsoluteStyles = (position: Position) => {
    switch (position) {
      case Position.BottomRight:
        this._setAbsoluteBottomRightStyles();
        break;
      case Position.BottomLeft:
        this._setAbsoluteBottomLeftStyles();
        break;
      case Position.TopRight:
        this._setAbsoluteTopRightStyles();
        break;
      case Position.TopLeft:
        this._setAbsoluteTopLeftStyles();
    }
    this._draggableItemRef.current!.style.bottom = '';
    this._draggableItemRef.current!.style.left = '';
  };
  private _setAbsoluteBottomRightStyles = () => {
    const [draggableItemBoundClientRect, draggableAreaBoundClientRect] = this._getBoundingClientRects();
    this._applyAbsoluteStyles(draggableAreaBoundClientRect.height - draggableItemBoundClientRect.height, 0);
  };
  private _setAbsoluteBottomLeftStyles = () => {
    const [draggableItemBoundClientRect, draggableAreaBoundClientRect] = this._getBoundingClientRects();
    this._applyAbsoluteStyles(
      draggableAreaBoundClientRect.height - draggableItemBoundClientRect.height,
      draggableAreaBoundClientRect.width - draggableItemBoundClientRect.width
    );
  };
  private _setAbsoluteTopRightStyles = () => {
    this._applyAbsoluteStyles(0, 0);
  };
  private _setAbsoluteTopLeftStyles = () => {
    const [draggableItemBoundClientRect, draggableAreaBoundClientRect] = this._getBoundingClientRects();
    this._applyAbsoluteStyles(0, draggableAreaBoundClientRect.width - draggableItemBoundClientRect.width);
  };

  private _stopDrag = () => {
    // stop moving when mouse button is released:
    this.setState({
      isDragging: false
    });
    this.props.eventManager.unlisten(document, DragEvents.MouseMove);
    this.props.eventManager.unlisten(document, DragEvents.TouchMove);
    const [draggableItemBoundClientRect, draggableAreaBoundClientRect] = this._getBoundingClientRects();
    const draggableContainerCenterX = draggableItemBoundClientRect.x + draggableItemBoundClientRect.width / 2;
    const draggableContainerCenterY = draggableItemBoundClientRect.y + draggableItemBoundClientRect.height / 2;
    const guiClientCenterX = draggableAreaBoundClientRect.x + draggableAreaBoundClientRect.width / 2;
    const guiClientCenterY = draggableAreaBoundClientRect.y + draggableAreaBoundClientRect.height / 2;
    if (draggableContainerCenterX > guiClientCenterX) {
      if (draggableContainerCenterY > guiClientCenterY) {
        this._handleChangePosition(Position.BottomRight);
      } else {
        this._handleChangePosition(Position.TopRight);
      }
    } else {
      if (draggableContainerCenterY > guiClientCenterY) {
        this._handleChangePosition(Position.BottomLeft);
      } else {
        this._handleChangePosition(Position.TopLeft);
      }
    }
  };

  render() {
    const draggableItemStyles = [styles.draggableItem];
    if (this.state.isDragging) {
      draggableItemStyles.push(styles.dragging);
    }
    return (
      <div id="draggeble-area" className={styles.draggableArea} ref={this._draggableAreaRef}>
        <div id="draggable-item" ref={this._draggableItemRef} className={draggableItemStyles.join(' ')} onTransitionEnd={this._setRelativeStyles}>
          {this._renderChildComponent()}
        </div>
      </div>
    );
  }
}
