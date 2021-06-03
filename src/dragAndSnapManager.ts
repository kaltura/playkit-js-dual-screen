// @ts-ignore
import {core} from 'kaltura-player-js';
import {Position} from './enums/positionEnum';
import {getClientX, getClientY} from './utils';
import {GuiClientRect} from './types';
const {EventType, FakeEvent, Error, StateType} = core;

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
  _onPositionChanged: OnPositionChangedCallback[] = [];
  _gueClientRec: GuiClientRect | null = null;
  _currMousePos: {x: number; y: number} = {x: 0, y: 0};
  _throttleWait: boolean = false;

  constructor(eventManager: KalturaPlayerTypes.EventManager, logger: KalturaPlayerTypes.Logger) {
    this._eventManager = eventManager;
    this._logger = logger;
  }

  public onPositionChanged = (cb: OnPositionChangedCallback) => {
    this._onPositionChanged.push(cb);
  };

  public setDraggableContainer = (draggableContainer: HTMLDivElement) => {
    this._draggableContainer = draggableContainer;
    this._addListeners();
  };

  public setGuiClientRect = (gueClientRec: GuiClientRect) => {
    this._gueClientRec = gueClientRec;
  };

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

    this._eventManager.listen(document, moveEventName, e => {
      this._moveDrag(e);
    });
  }

  private _moveDrag(e: MouseEvent | TouchEvent) {
    if (this._throttleWait) return;
    e = e || window.event;
    // calculate the new cursor position:
    const deltaMousePosX = this._currMousePos.x - getClientX(e);
    const deltaMousePosY = this._currMousePos.y - getClientY(e);
    this._currMousePos.x = getClientX(e);
    this._currMousePos.y = getClientY(e);
    // set the element's new position
    if (this._draggableContainer && this._gueClientRec) {
      const boundClientRect = this._draggableContainer.getBoundingClientRect();
      const draggableContainerCenterX = boundClientRect.x + boundClientRect.width / 2;
      const draggableContainerCenterY = boundClientRect.y + boundClientRect.height / 2;

      // const guiClientCenterX = this._gueClientRec.x + this._gueClientRec.width / 2;
      // const guiClientCenterY = this._gueClientRec.y + this._gueClientRec.height / 2;

      const top = parseInt(this._draggableContainer.style.top, 10);
      const bottom = parseInt(this._draggableContainer.style.bottom, 10);
      const right = parseInt(this._draggableContainer.style.right, 10);
      const left = parseInt(this._draggableContainer.style.left, 10);

      // TODO: try calculate from center of _draggableContainer what sizes we should increase

      const xShift = Math.max(Number.isInteger(left) ? this._gueClientRec.left : this._gueClientRec.right, Number.isInteger(left) ? left + deltaMousePosX : right + deltaMousePosX);
      const yShift = Math.max(0, Number.isInteger(bottom) ? bottom + deltaMousePosY : top + deltaMousePosY);

      if (Number.isInteger(left)) {
        this._draggableContainer.style.left = `${xShift}px`;
        this._draggableContainer.style.right = "";
      } else {
        this._draggableContainer.style.right = `${xShift}px`;
        this._draggableContainer.style.left = "";
      }

      if (Number.isInteger(bottom)) {
        this._draggableContainer.style.bottom = `${yShift}px`;
      } else {
        this._draggableContainer.style.top = `${yShift}px`;
      }

    }

    // handle throttling to avoid performance issues on dragging
    this._throttleWait = true;
    setTimeout(() => {
      this._throttleWait = false;
    }, DRAG_THROTTLE_MS);
  }

  private _stopDrag = () => {
    // stop moving when mouse button is released:
    this._eventManager.unlisten(document, DragEvents.MouseMove);
    this._eventManager.unlisten(document, DragEvents.TouchMove);
  };

  public reset = () => {
    this._onPositionChanged = [];
    this._draggableContainer = null;
  };
}
