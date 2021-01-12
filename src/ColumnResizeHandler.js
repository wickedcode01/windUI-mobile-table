import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { defaultClassPrefix,DOMMouseMoveTracker } from './utils';


class ColumnResizeHandler extends React.Component {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-column-resize-spanner')
  };

  constructor(props) {
    super(props);
    this.columnWidth = props.columnWidth || 0;
  }

  shouldComponentUpdate(nextProps) {
    if (
      nextProps.initialEvent &&
      this.isKeyDown &&
      this.mouseMoveTracker &&
      !this.mouseMoveTracker.isDragging()
    ) {
      this.mouseMoveTracker.captureMouseMoves(nextProps.initialEvent);
    }

    if (nextProps.columnWidth !== this.props.columnWidth) {
      this.columnWidth = nextProps.columnWidth;
    }
    return true;
  }

  componentWillUnmount() {
    if (this.mouseMoveTracker) {
      this.mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
  }

  onMove = (deltaX) => {
    if (!this.isKeyDown) {
      return;
    }

    const { onColumnResizeMove, columnWidth, columnLeft, columnFixed } = this.props;
    this.cursorDelta += deltaX;
    this.columnWidth = _.clamp(columnWidth + this.cursorDelta, 20, 20000);
    onColumnResizeMove && onColumnResizeMove(this.columnWidth, columnLeft, columnFixed);
  };
  onColumnResizeEnd = () => {
    const { onColumnResizeEnd } = this.props;
    this.isKeyDown = false;

    onColumnResizeEnd && onColumnResizeEnd(this.columnWidth, this.cursorDelta);

    if (this.mouseMoveTracker) {
      this.mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
  };
  onColumnResizeMouseDown = (event) => {
    const { onColumnResizeStart } = this.props;

    this.mouseMoveTracker = this.getMouseMoveTracker();
    this.isKeyDown = true;
    this.cursorDelta = 0;

    const client = {
      clientX: event.clientX,
      clientY: event.clientY,
      preventDefault: () => {}
    };

    onColumnResizeStart && onColumnResizeStart(client);
  };

  getMouseMoveTracker() {
    return (
      this.mouseMoveTracker ||
      new DOMMouseMoveTracker(this.onMove, this.onColumnResizeEnd, document.body)
    );
  }

  columnWidth = 0;
  cursorDelta = 0;
  mouseMoveTracker;
  isKeyDown;

  render() {
    const { columnLeft = 0, classPrefix, height, className, style } = this.props;
    const styles = {
      left: this.columnWidth + columnLeft - 2,
      height,
      width:10,
      position:'absolute',
      ...style,
      zIndex:99,
      cursor:'e-resize'
    };

    const classes = classNames(classPrefix, className);

    return (
      <div
        className={classes}
        style={styles}
        onMouseDown={this.onColumnResizeMouseDown}
        role="button"
      />
    );
  }
}

export default ColumnResizeHandler;
