import {h, Component, cloneElement, VNode, createRef} from 'preact';
import {Position} from '../../enums/positionEnum';
import {getClientX, getClientY, makeStyleString} from '../../utils';
import {GuiClientRect} from '../../types';
import * as styles from './drag-and-snap-manager.scss';

const {
  redux: {connect}
} = KalturaPlayer.ui;

const INITIAL_POSITION = -150;

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

interface DragAndSnapManagerOwnProps {
  children: VNode;
  onPositionChanged: OnPositionChangedCallback;
  position: Position;
}
interface DragAndSnapManagerConnectProps {
  guiClientRect?: GuiClientRect;
  eventManager: KalturaPlayerTypes.EventManager;
  logger: KalturaPlayerTypes.Logger;
  prePlayback?: boolean;
}
type DragAndSnapManagerProps = DragAndSnapManagerOwnProps & DragAndSnapManagerConnectProps;
interface DragAndSnapManagerState {
  isDragging: boolean;
}

const mapStateToProps = (state: Record<string, any>) => ({
  guiClientRect: state.shell.guiClientRect,
  prePlayback: state.engine.prePlayback
});
@connect(mapStateToProps)
export class DragAndSnapManager extends Component<DragAndSnapManagerProps, DragAndSnapManagerState> {
  _draggableContainerRef = createRef<HTMLDivElement>();
  _currMousePos: {x: number; y: number} = {x: 0, y: 0};
  _throttleWait: boolean = false;
  state = {
    isDragging: false
  };

  componentDidMount() {
    this._addListeners();
  }

  componentWillUnmount() {
    const {eventManager} = this.props;
    eventManager.unlisten(document, DragEvents.MouseMove);
    eventManager.unlisten(document, DragEvents.TouchMove);
    eventManager.unlisten(document, DragEvents.MouseUp);
    eventManager.unlisten(document, DragEvents.TouchEnd);
    eventManager.unlisten(this._draggableContainerRef.current!, DragEvents.MouseDown);
    eventManager.unlisten(this._draggableContainerRef.current!, DragEvents.TouchStart);
  }

  private _renderChildComponent = (): VNode => {
    const {children} = this.props;
    return cloneElement(children, {isDragging: this.state.isDragging});
  };

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

  private _addListeners = () => {
    this.props.eventManager.listen(this._draggableContainerRef.current!, DragEvents.MouseDown, e => {
      this._startDrag(e, DragEvents.MouseMove, DragEvents.MouseUp);
    });
    this.props.eventManager.listen(this._draggableContainerRef.current!, DragEvents.TouchStart, e => {
      this.props.eventManager.unlisten(this._draggableContainerRef.current!, DragEvents.MouseDown);
      this._startDrag(e, DragEvents.TouchMove, DragEvents.TouchEnd);
    });
  };

  private _startDrag(e: MouseEvent | TouchEvent, moveEventName: string, endEventName: string) {
    this.props.eventManager.listenOnce(document, endEventName, () => {
      this._stopDrag();
    });

    // get the mouse cursor position at startup:
    this._currMousePos.x = getClientX(e);
    this._currMousePos.y = getClientY(e);

    this.props.eventManager.listen(document, moveEventName, this._moveDrag);
    this.props.eventManager.listenOnce(document, moveEventName, this._onStartDrag);
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
    if (this._draggableContainerRef.current && this.props.guiClientRect) {
      let top = parseInt(this._draggableContainerRef.current!.style.top, 10);
      let bottom = parseInt(this._draggableContainerRef.current!.style.bottom, 10);
      let right = parseInt(this._draggableContainerRef.current!.style.right, 10);
      let left = parseInt(this._draggableContainerRef.current!.style.left, 10);

      if (Number.isInteger(right)) {
        this._draggableContainerRef.current!.style.right = makeStyleString(right + deltaMousePosX);
      } else {
        this._draggableContainerRef.current!.style.left = makeStyleString(left - deltaMousePosX);
      }
      if (Number.isInteger(bottom)) {
        this._draggableContainerRef.current!.style.bottom = makeStyleString(bottom + deltaMousePosY);
      } else {
        this._draggableContainerRef.current!.style.top = makeStyleString(top - deltaMousePosY);
      }
    }

    // handle throttling to avoid performance issues on dragging
    this._throttleWait = true;
    setTimeout(() => {
      this._throttleWait = false;
    }, DRAG_THROTTLE_MS);
  };

  private _moveToBottomRight = () => {
    this._draggableContainerRef.current!.style.top = '';
    this._draggableContainerRef.current!.style.right = '0px';
    this._draggableContainerRef.current!.style.bottom = '0px';
    this._draggableContainerRef.current!.style.left = '';
  };

  private _moveToTopRight = () => {
    this._draggableContainerRef.current!.style.top = '0px';
    this._draggableContainerRef.current!.style.right = '0px';
    this._draggableContainerRef.current!.style.bottom = '';
    this._draggableContainerRef.current!.style.left = '';
  };

  private _moveToBottomLeft = () => {
    this._draggableContainerRef.current!.style.top = '';
    this._draggableContainerRef.current!.style.right = '';
    this._draggableContainerRef.current!.style.bottom = '0px';
    this._draggableContainerRef.current!.style.left = '0px';
  };

  private _moveToTopLeft = () => {
    this._draggableContainerRef.current!.style.top = '0px';
    this._draggableContainerRef.current!.style.right = '';
    this._draggableContainerRef.current!.style.bottom = '';
    this._draggableContainerRef.current!.style.left = '0px';
  };

  private _stopDrag = () => {
    // stop moving when mouse button is released:
    this._onStopDrag();
    this.props.eventManager.unlisten(document, DragEvents.MouseMove);
    this.props.eventManager.unlisten(document, DragEvents.TouchMove);
    const boundClientRect = this._draggableContainerRef.current!.getBoundingClientRect();
    const draggableContainerCenterX = boundClientRect.x + boundClientRect.width / 2;
    const draggableContainerCenterY = boundClientRect.y + boundClientRect.height / 2;
    const guiClientCenterX = this.props.guiClientRect!.x + this.props.guiClientRect!.width / 2;
    const guiClientCenterY = this.props.guiClientRect!.y + this.props.guiClientRect!.height / 2;
    let position: Position;
    if (draggableContainerCenterX > guiClientCenterX) {
      if (draggableContainerCenterY > guiClientCenterY) {
        position = Position.BottomRight;
        this._moveToBottomRight();
      } else {
        position = Position.TopRight;
        this._moveToTopRight();
      }
    } else {
      if (draggableContainerCenterY > guiClientCenterY) {
        position = Position.BottomLeft;
        this._moveToBottomLeft();
      } else {
        position = Position.TopLeft;
        this._moveToTopLeft();
      }
    }
    this.props.onPositionChanged(position);
  };

  render(props: DragAndSnapManagerProps) {
    const pipContainerStyles: Record<string, number> = {};
    switch (props.position) {
      case Position.BottomRight:
        pipContainerStyles.bottom = props.prePlayback ? INITIAL_POSITION : 0;
        pipContainerStyles.right = 0;
        break;
      case Position.BottomLeft:
        pipContainerStyles.bottom = props.prePlayback ? INITIAL_POSITION : 0;
        pipContainerStyles.left = 0;
        break;
      case Position.TopRight:
        pipContainerStyles.top = props.prePlayback ? INITIAL_POSITION : 0;
        pipContainerStyles.right = 0;
        break;
      case Position.TopLeft:
        pipContainerStyles.top = props.prePlayback ? INITIAL_POSITION : 0;
        pipContainerStyles.left = 0;
    }
    return (
      <div id="draggable-container" ref={this._draggableContainerRef} className={styles.draggableContainer} style={pipContainerStyles}>
        {this._renderChildComponent()}
      </div>
    );
  }
}
