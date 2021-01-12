import * as React from 'react';
import classNames from 'classnames';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';

class CellGroup extends React.PureComponent {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell-group'),
  };

  addPrefix = (name) => prefix(this.props.classPrefix)(name);

  render() {
    const {
      fixed,
      width,
      left,
      height,
      style,
      classPrefix,
      className,
      ...rest
    } = this.props;
    const classes = classNames(classPrefix, className, {
      [this.addPrefix(`fixed-${fixed || ''}`)]: fixed,
      [this.addPrefix('scroll')]: !fixed
    });
    const styles = {
      width,
      height,
      ...style
    };
    const unhandled = getUnhandledProps(CellGroup, rest);
    return <div {...unhandled} className={classes} style={styles} />;
  }
}

export default CellGroup;
