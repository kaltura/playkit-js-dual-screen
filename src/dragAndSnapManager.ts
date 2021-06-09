import {Position} from './enums/positionEnum';
import {getClientX, getClientY, makeStyleString} from './utils';
import {GuiClientRect} from './types';

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

export class DragAndSnapManager {
  _eventManager: KalturaPlayerTypes.EventManager;
  _logger: KalturaPlayerTypes.Logger;
  _draggableContainer: HTMLDivElement | null = null;
  _onPositionChanged: OnPositionChangedCallback;
  _onStartDrag: () => void = () => {};
  _onStopDrag: () => void = () => {};
  _gueClientRect: GuiClientRect | null = null;
  _currMousePos: {x: number; y: number} = {x: 0, y: 0};
  _throttleWait: boolean = false;

  constructor(eventManager: KalturaPlayerTypes.EventManager, logger: KalturaPlayerTypes.Logger, fn: OnPositionChangedCallback) {
    this._eventManager = eventManager;
    this._logger = logger;
    this._onPositionChanged = fn;
  }

  // Drag and snap public API
  public setDraggableContainer = (draggableContainer: HTMLDivElement) => {
    this._draggableContainer = draggableContainer;
    this._addListeners();
  };

  public setGuiClientRect = (gueClientRec: GuiClientRect) => {
    this._gueClientRect = gueClientRec;
  };

  public onStartDrag = (fn: () => void) => {
    this._onStartDrag = fn;
  }

  public onStopDrag = (fn: () => void) => {
    this._onStopDrag = fn;
  }

  private _addListeners = () => {
    this._eventManager.listen(this._draggableContainer!, DragEvents.MouseDown, e => {
      this._startDrag(e, DragEvents.MouseMove, DragEvents.MouseUp);
    });
    this._eventManager.listen(this._draggableContainer!, DragEvents.TouchStart, e => {
      this._eventManager.unlisten(this._draggableContainer!, DragEvents.MouseDown);
      this._startDrag(e, DragEvents.TouchMove, DragEvents.TouchEnd);
    });
  };

  private _startDrag(e: MouseEvent | TouchEvent, moveEventName: string, endEventName: string) {
    this._eventManager.listenOnce(document, endEventName, () => {
      this._stopDrag();
    });

    // get the mouse cursor position at startup:
    this._currMousePos.x = getClientX(e);
    this._currMousePos.y = getClientY(e);

    this._eventManager.listen(document, moveEventName, this._moveDrag);
    this._eventManager.listenOnce(document, moveEventName, this._onStartDrag);
  }

  private _moveDrag = (e: MouseEvent | TouchEvent) => {
    if (this._throttleWait) {
      return;
    };
    e = e || window.event;
    // calculate the new cursor position:
    const deltaMousePosX = this._currMousePos.x - getClientX(e);
    const deltaMousePosY = this._currMousePos.y - getClientY(e);
    this._currMousePos.x = getClientX(e);
    this._currMousePos.y = getClientY(e);
    // set the element's new position
    if (this._draggableContainer && this._gueClientRect) {
      let top = parseInt(this._draggableContainer.style.top, 10);
      let bottom = parseInt(this._draggableContainer.style.bottom, 10);
      let right = parseInt(this._draggableContainer.style.right, 10);
      let left = parseInt(this._draggableContainer.style.left, 10);

      if (Number.isInteger(right)) {
        right = right + deltaMousePosX;
      } else {
        left = left - deltaMousePosX;
      }
      if (Number.isInteger(bottom)) {
        bottom = bottom + deltaMousePosY;
      } else {
        top = top - deltaMousePosY;
      }

      this._draggableContainer.style.top = makeStyleString(top);
      this._draggableContainer.style.right = makeStyleString(right);
      this._draggableContainer.style.bottom = makeStyleString(bottom);
      this._draggableContainer.style.left = makeStyleString(left);
    }

    // handle throttling to avoid performance issues on dragging
    this._throttleWait = true;
    setTimeout(() => {
      this._throttleWait = false;
    }, DRAG_THROTTLE_MS);
  }

  private _stopDrag = () => {
    // stop moving when mouse button is released:
    this._onStopDrag();
    this._eventManager.unlisten(document, DragEvents.MouseMove);
    this._eventManager.unlisten(document, DragEvents.TouchMove);
    if (this._draggableContainer && this._gueClientRect) {
      const boundClientRect = this._draggableContainer.getBoundingClientRect();
      const draggableContainerCenterX = boundClientRect.x + boundClientRect.width / 2;
      const draggableContainerCenterY = boundClientRect.y + boundClientRect.height / 2;
      const guiClientCenterX = this._gueClientRect.x + this._gueClientRect.width / 2;
      const guiClientCenterY = this._gueClientRect.y + this._gueClientRect.height / 2;
      let position: Position;
      if (draggableContainerCenterX > guiClientCenterX) {
        if (draggableContainerCenterY > guiClientCenterY) {
          position = Position.BottomRight;
          this._draggableContainer.style.top = '';
          this._draggableContainer.style.right = '0px';
          this._draggableContainer.style.bottom = '0px';
          this._draggableContainer.style.left = '';
        } else {
          position = Position.TopRight;
          this._draggableContainer.style.top = '0px';
          this._draggableContainer.style.right = '0px';
          this._draggableContainer.style.bottom = '';
          this._draggableContainer.style.left = '';
        }
      } else {
        if (draggableContainerCenterY > guiClientCenterY) {
          position = Position.BottomLeft;
          this._draggableContainer.style.top = '';
          this._draggableContainer.style.right = '';
          this._draggableContainer.style.bottom = '0px';
          this._draggableContainer.style.left = '0px';
        } else {
          position = Position.TopLeft;
          this._draggableContainer.style.top = '0px';
          this._draggableContainer.style.right = '';
          this._draggableContainer.style.bottom = '';
          this._draggableContainer.style.left = '0px';
        }
      }
      this._onPositionChanged(position);
    }
  };

  public destroy = () => {
    this._eventManager.unlisten(document, DragEvents.MouseMove);
    this._eventManager.unlisten(document, DragEvents.TouchMove);
    this._eventManager.unlisten(document, DragEvents.MouseUp);
    this._eventManager.unlisten(document, DragEvents.TouchEnd);
    this._eventManager.unlisten(this._draggableContainer!, DragEvents.MouseDown);
    this._eventManager.unlisten(this._draggableContainer!, DragEvents.TouchStart);
    this._draggableContainer = null;
  };
}
