import on from './on';


class DOMMouseMoveTracker {
  isDraggingStatus = false;
  animationFrameID = null;
  domNode;
  onMove;
  onMoveEnd;
  eventMoveToken = null;
  eventUpToken = null;
  moveEvent = null;
  deltaX = 0;
  deltaY = 0;
  x= 0;
  y = 0;

  /**
   * onMove is the callback that will be called on every mouse move.
   * onMoveEnd is called on mouse up when movement has ended.
   */
  constructor(onMove, onMoveEnd, domNode) {
    this.domNode = domNode;
    this.onMove = onMove;
    this.onMoveEnd = onMoveEnd;
  }


  captureMouseMoves(event) {
    if (!this.eventMoveToken && !this.eventUpToken) {
      this.eventMoveToken = on(this.domNode, 'mousemove', this.onMouseMove);
      this.eventUpToken = on(this.domNode, 'mouseup', this.onMouseUp);
    }

    if (!this.isDraggingStatus) {
      this.deltaX = 0;
      this.deltaY = 0;
      this.isDraggingStatus = true;
      this.x = event.clientX;
      this.y = event.clientY;
    }

    event.preventDefault();
  }

  /**
   * These releases all of the listeners on document.body.
   */
  releaseMouseMoves() {
    if (this.eventMoveToken) {
      this.eventMoveToken.off();
      this.eventMoveToken = null;
    }

    if (this.eventUpToken) {
      this.eventUpToken.off();
      this.eventUpToken = null;
    }

    if (this.animationFrameID !== null) {
      cancelAnimationFrame(this.animationFrameID);
      this.animationFrameID = null;
    }

    if (this.isDraggingStatus) {
      this.isDraggingStatus = false;
      this.x = 0;
      this.y = 0;
    }
  }

  /**
   * Returns whether or not if the mouse movement is being tracked.
   */
  isDragging = () => this.isDraggingStatus;

  /**
   * Calls onMove passed into constructor and updates internal state.
   */
  onMouseMove = (event) => {
    let x= event.clientX;
    let y = event.clientY;

    this.deltaX += x - this.x;
    this.deltaY += y - this.y;

    if (this.animationFrameID === null) {
      this.animationFrameID = requestAnimationFrame(this.didMouseMove);
    }

    this.x = x;
    this.y = y;

    this.moveEvent = event;
    event.preventDefault();
  };

  didMouseMove = () => {
    this.animationFrameID = null;
    this.onMove(this.deltaX, this.deltaY, this.moveEvent);

    this.deltaX = 0;
    this.deltaY = 0;
  };
  /**
   * Calls onMoveEnd passed into constructor and updates internal state.
   */
  onMouseUp = () => {
    if (this.animationFrameID) {
      this.didMouseMove();
    }
    this.onMoveEnd && this.onMoveEnd();
  };
}

export default DOMMouseMoveTracker;
