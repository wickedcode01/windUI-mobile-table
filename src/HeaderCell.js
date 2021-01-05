import * as React from 'react';
import classNames from 'classnames';
import Cell from './Cell';
import { isNullOrUndefined, getUnhandledProps, defaultClassPrefix, prefix } from './utils';
import ColumnResizeHandler from './ColumnResizeHandler';
class HeaderCell extends React.PureComponent {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell-header')
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.width !== prevState.width || nextProps.flexGrow !== prevState.flexGrow) {
      return {
        width: nextProps.width,
        flexGrow: nextProps.flexGrow,
        columnWidth: isNullOrUndefined(nextProps.flexGrow) ? nextProps.width : 0
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      width: props.width,
      flexGrow: props.flexGrow,
      columnWidth: isNullOrUndefined(props.flexGrow) ? props.width : 0
    };
  }

  handleColumnResizeStart = (event) => {
    const { left, fixed, onColumnResizeStart } = this.props;
    this.setState({ initialEvent: event });
    onColumnResizeStart && onColumnResizeStart(this.state.columnWidth, left, !!fixed);
  };

  handleColumnResizeEnd = (columnWidth, cursorDelta) => {
    const { dataKey, index, onColumnResizeEnd, onResize } = this.props;
    this.setState({ columnWidth });
    onColumnResizeEnd && onColumnResizeEnd(columnWidth, cursorDelta, dataKey, index);
    onResize && onResize(columnWidth, dataKey);
  };

  handleClick = () => {
    const { sortable, dataKey, onSortColumn } = this.props;
    if (sortable && onSortColumn) {
      onSortColumn(dataKey);
    }
  };

  addPrefix = (name) => prefix(this.props.classPrefix)(name);
  renderResizeSpanner() {
    const { resizable, left, onColumnResizeMove, fixed, headerHeight } = this.props;
    const { columnWidth, initialEvent } = this.state;

    if (!resizable) {
      return null;
    }

    return (
      <ColumnResizeHandler
        columnWidth={columnWidth}
        columnLeft={left}
        columnFixed={!!fixed}
        height={headerHeight ? headerHeight - 1 : undefined}
        initialEvent={initialEvent}
        onColumnResizeMove={onColumnResizeMove}
        onColumnResizeStart={this.handleColumnResizeStart}
        onColumnResizeEnd={this.handleColumnResizeEnd}
      />
    );
  }

  //渲染排序图标
  renderSortColumn() {
    const { sortable, sortColumn, sortType = '', dataKey } = this.props;
    if (sortable) {
      const iconClasses = classNames(this.addPrefix('icon-sort'), {
        [this.addPrefix(`icon-sort-${sortType}`)]: sortColumn === dataKey
      });
      return (
        <span className={this.addPrefix('sort-wrapper')}>
          <i className={iconClasses} />
        </span>
      );
    }
    return null;
  }

  render() {
    const {
      className,
      width,
      dataKey,
      headerHeight,
      children,
      left,
      sortable,
      classPrefix,
      ...rest
    } = this.props;
    const classes = classNames(classPrefix, className, {
      [this.addPrefix('sortable')]: sortable
    });
    const unhandled = getUnhandledProps(HeaderCell, rest);

    return (
      <div className={classes}>
        <Cell
          {...unhandled}
          width={width}
          dataKey={dataKey}
          left={left}
          headerHeight={headerHeight}
          isHeaderCell={true}
          onClick={this.handleClick}
        >
          <span>{children}</span>
          {this.renderSortColumn()}
        </Cell>
        {this.renderResizeSpanner()}
      </div>
    );
  }
}



export default HeaderCell;
