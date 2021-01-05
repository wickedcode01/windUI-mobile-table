import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { LAYER_WIDTH } from './constants';
import { isNullOrUndefined, defaultClassPrefix, prefix,separator } from './utils';


class Cell extends React.PureComponent {
  state = { input: false }
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell'),
    align: 'left',
    headerHeight: 36,
    depth: 0,
    height: 36,
    width: 0,
    left: 0,
    verticalAlign: 'middle',
    type: 'string',
    digit: 2,
  };

  addPrefix = (name) => prefix(this.props.classPrefix)(name);

  render() {
    const {
      width,
      left,
      height,
      style,
      className,
      firstColumn,
      lastColumn,
      isHeaderCell,
      headerHeight,
      align,
      children,
      rowData,
      rowIndex,
      dataKey,
      removed,
      wordWrap,
      classPrefix,
      depth,
      verticalAlign,
      editable,
      type,
      digit,
      onClick
    } = this.props;

    if (removed) {
      return null;
    }

    const classes = classNames(classPrefix, className, {
      [this.addPrefix('first')]: firstColumn,
      [this.addPrefix('last')]: lastColumn
    });

    const nextHeight = isHeaderCell ? headerHeight : height;
    const styles = {
      width,
      height: nextHeight,
      zIndex: depth,
      left
    };

    const contentStyles = {
      width,
      height: nextHeight,
      textAlign: align,
      paddingLeft: firstColumn ? depth * LAYER_WIDTH + 10 : null,
      ...style
    };

    if (verticalAlign) {
      contentStyles.display = 'table-cell';
      contentStyles.verticalAlign = verticalAlign;
    }

    let contentChildren = isNullOrUndefined(children) && rowData ? _.get(rowData, dataKey) : children;

    if (typeof children === 'function') {
      contentChildren = children(rowData, rowIndex);
    }

    const renderFormat = (val) => {
      switch (type) {
        case 'string': return val;
        case 'number': return separator(Number(val).toFixed(digit)) ;
        default: return val;
      }
    }

    return (
      <div className={classes} style={styles} onClick={(e) => {
        if (onClick) {
          onClick(e)
        } else if (editable) {
          this.setState({ input: true })
        }
      }}>
        {wordWrap ? (
          <div className={this.addPrefix('content')} style={contentStyles}>
            <div className={this.addPrefix('wrap')}>
              {this.state.input ? 
                <input style={{ width: '100%' }} ref={ref => this.input = ref} autoFocus="autoFocus" onBlur={(e) => {editable(rowIndex, dataKey, e.target.value);this.setState({ input: false })}} /> : renderFormat(contentChildren)}
            </div>
          </div>
        ) : (
            <div className={this.addPrefix('content')} style={contentStyles}>
              {this.state.input ? <input style={{ width: '100%' }} ref={ref => this.input = ref} autoFocus="autoFocus" onBlur={(e) => {
                editable(rowIndex, dataKey, e.target.value)
                this.setState({ input: false })
              }} /> : renderFormat(contentChildren)}
            </div>
          )}
      </div>
    );
  }
}

export default Cell;
