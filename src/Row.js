import * as React from 'react';
import classNames from 'classnames';
import { defaultClassPrefix, getUnhandledProps, prefix, translateDOMPositionXY } from './utils';

class Row extends React.PureComponent {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-row'),
    height: 46,
    headerHeight: 40,
    isHeaderRow: false,
    updatePosition: translateDOMPositionXY
  };
  render() {
    const {
      className,
      width,
      height,
      top,
      style,
      isHeaderRow,
      headerHeight,
      rowRef,
      classPrefix,
      updatePosition,
      ...rest
    } = this.props;

    const addPrefix = prefix(classPrefix);
    const classes = classNames(classPrefix, className, {
      [addPrefix('header')]: isHeaderRow
    });

    const styles = {
      height: isHeaderRow ? headerHeight : height,
      // width,
      ...style
    };

    updatePosition(styles, 0, top);

    const unhandled = getUnhandledProps(Row, rest);

    return <div {...unhandled} ref={rowRef} className={classes} style={styles} />;
  }
}

export default Row;
