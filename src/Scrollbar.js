import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { SCROLLBAR_MIN_WIDTH } from './constants';
import { defaultClassPrefix, prefix, translateDOMPositionXY ,DOMMouseMoveTracker, addStyle, getOffset  } from './utils';


class Scrollbar extends React.PureComponent {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-scrollbar'),
    updatePosition: translateDOMPositionXY,
    scrollLength: 1,
    length: 1
  };

  constructor(props) {
    super(props);
    this.state = {
      barOffset: {
        top: 0,
        left: 0
      },
      handlePressed: false
    };
  }

  componentDidMount() {
    this.initBarOffset();
  }

  componentWillUnmount() {
    this.releaseMouseMoves();
  }

  onWheelScroll(delta) {
    const { length, scrollLength,forceScrollHeight } = this.props;
    const nextDelta=forceScrollHeight? Math.abs(delta)/delta : delta / (scrollLength / length);
    this.updateScrollBarPosition(nextDelta);
  }

  getMouseMoveTracker() {
    return (
      this.mouseMoveTracker ||
      new DOMMouseMoveTracker(this.handleDragMove, this.handleDragEnd, document.body)
    );
  }

  initBarOffset() {
    setTimeout(() => {
      this.bar &&
        this.setState({
          barOffset: getOffset(this.bar)
        });
    }, 1);
  }

  handleMouseDown = (event) => {
    const { onMouseDown } = this.props;
    this.mouseMoveTracker = this.getMouseMoveTracker();
    this.mouseMoveTracker.captureMouseMoves(event);
    this.setState({
      handlePressed: true
    });
    onMouseDown && onMouseDown(event);
  };

  handleDragEnd = () => {
    this.releaseMouseMoves();
    this.setState({
      handlePressed: false
    });
  };

  handleScroll(delta, event) {
    const { length, scrollLength, onScroll, forceScrollHeight } = this.props;
    let scrollDelta = delta * (scrollLength / length);
    if (forceScrollHeight) {
      // delta=delta*forceScrollHeight/Math.abs(scrollDelta) ||0
      scrollDelta = (Math.abs(scrollDelta) < forceScrollHeight ? forceScrollHeight * Math.abs(scrollDelta) / scrollDelta : scrollDelta) || 0
    }
    this.updateScrollBarPosition(delta);
    onScroll && onScroll(scrollDelta, event);
  }

  resetScrollBarPosition(forceDelta = 0) {
    this.scrollOffset = 0;
    this.updateScrollBarPosition(0, forceDelta);
  }

  updateScrollBarPosition(delta, forceDelta) {
    const { vertical, length, scrollLength, updatePosition, forceScrollHeight } = this.props;
    let max = 0
    if (scrollLength && length & forceScrollHeight) {
      max = scrollLength / forceScrollHeight;
    } else if (scrollLength && length) {
      max = length - Math.max((length / scrollLength) * length, SCROLLBAR_MIN_WIDTH + 2)
    }

    const styles = {};

    if (_.isUndefined(forceDelta)) {
      this.scrollOffset += delta;
      this.scrollOffset = Math.max(this.scrollOffset, 0);
      this.scrollOffset = Math.min(this.scrollOffset, max);
    } else {
      this.scrollOffset = forceDelta || 0;
    }

    if (vertical) {
      updatePosition(styles, 0, this.scrollOffset);

    } else {
      updatePosition(styles, this.scrollOffset, 0);
    }

    addStyle(this.handle, styles);
  }

  releaseMouseMoves() {
    if (this.mouseMoveTracker) {
      this.mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
  }

  handleDragMove = (deltaX, deltaY, event) => {
    const { vertical } = this.props;
    if (!this.mouseMoveTracker || !this.mouseMoveTracker.isDragging()) {
      return;
    }

    if (_.get(event, 'buttons') === 0 || _.get(window, 'event.buttons') === 0) {
      this.releaseMouseMoves();
      return;
    }

    this.handleScroll(vertical ? deltaY : deltaX, event);
  };

  /**
   * 点击滚动条，然后滚动到指定位置
   */
  handleClick = (event) => {
    if (this.handle && this.handle.contains(event.target)) {
      return;
    }

    const { vertical, length, scrollLength } = this.props;
    const { barOffset } = this.state;
    const offset = vertical ? event.pageY - barOffset.top : event.pageX - barOffset.left;

    const handleWidth = (length / scrollLength) * length;
    const delta = offset - handleWidth;

    const nextDelta =
      offset > this.scrollOffset ? delta - this.scrollOffset : offset - this.scrollOffset;
    this.handleScroll(nextDelta, event);
  };

  scrollOffset = 0;


  bindBarRef = (ref) => {
    this.bar = ref;
  };

  bindHandleRef = (ref) => {
    this.handle = ref;
  };

  render() {
    const { vertical, length, scrollLength, classPrefix, className, forceScrollHeight } = this.props;
    const { handlePressed } = this.state;
    const addPrefix = prefix(classPrefix);
    const classes = classNames(classPrefix, className, {
      [addPrefix('vertical')]: vertical,
      [addPrefix('horizontal')]: !vertical,
      [addPrefix('hide')]: scrollLength <= length,
      [addPrefix('pressed')]: handlePressed
    });

    let styles = {};
    if (forceScrollHeight && vertical) {
      styles = {
        'height': `${(length - scrollLength / forceScrollHeight)}px`,
        'minHeight': SCROLLBAR_MIN_WIDTH
      };
    } else {
      styles = {
        [vertical ? 'height' : 'width']: `${(length / scrollLength) * 100}%`,
        [vertical ? 'minHeight' : 'minWidth']: SCROLLBAR_MIN_WIDTH
      };
    }

    return (
      <div
        ref={this.bindBarRef}
        className={classes}
        onClick={this.handleClick}
        role="toolbar"
      >
        <div
          ref={this.bindHandleRef}
          className={addPrefix('handle')}
          style={styles}
          onMouseDown={this.handleMouseDown}
          role="button"
          tabIndex={-1}
        />
      </div>
    );
  }
}

export default Scrollbar;
