import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import bindElementResize, { unbind as unbindElementResize } from 'element-resize-event';
import Row from './Row';
import CellGroup from './CellGroup';
import Scrollbar from './Scrollbar';
import { SCROLLBAR_MIN_WIDTH, SCROLLBAR_WIDTH, CELL_PADDING_HEIGHT } from './constants';
import {
  getTotalByColumns,
  defaultClassPrefix,
  toggleClass,
  prefix,
  resetLeftForCells,
  getTranslateDOMPositionXY,
  addStyle,
  getWidth,
  getHeight,
  WheelHandler,
  on,
  getOffset
} from './utils';

const columnHandledProps = [
  'align',
  'verticalAlign',
  'width',
  'fixed',
  'resizable',
  'flexGrow',
  'minWidth',
  'colSpan'
];

const SORT_TYPE = {
  DESC: 'desc',
  ASC: 'asc'
};


class Table extends React.Component {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table'),
    data: [],
    defaultSortType: SORT_TYPE.DESC,
    height: 200,
    rowHeight: 46,
    headerHeight: 40,
    minHeight: 0,
    hover: false,
    showHeader: true,
    virtualized: false,
    rowKey: 'key',
    translate3d: false,
    bordered: true,
    editable: false,
    showArrow: false,
    preLoad:2,
    locale: {
      emptyMessage: '暂无数据',
      loading: '加载中……'
    }
  };

  static getDerivedStateFromProps(props, state) {
    if (props.data !== state.cacheData) {
      return {
        cacheData: props.data,
        data: props.data
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    //props
    const {
      width,
      data,
      children = [],
      defaultSortType,
      shouldFixedColumn,
    } = props;

    //state
    this.state = {
      shouldFixedColumn,
      cacheData: data,
      data: data,
      width: width || 0,
      columnWidth: 0,
      dataKey: 0,
      contentHeight: 0,
      contentWidth: 0,
      tableRowsMaxHeight: [],
      sortType: defaultSortType,
      scrollY: 0,
      isScrolling: false,
      fixedHeader: false,
      MoreX: true
    };

    //global
    this.scrollY = 0;
    this.scrollX = 0;
    this.wheelHandler = new WheelHandler(
      this._listenWheel,
      this.shouldHandleWheelX,
      this.shouldHandleWheelY,
      false
    );
    this._cacheChildrenSize = _.flatten(children).length;
    this.translateDOMPositionXY = getTranslateDOMPositionXY({
      enable3DTransform: props.translate3d
    });
   
    
  }

  _listenWheel = (deltaX, deltaY) => {
    const { forceScrollRow, rowHeight } = this.props
    if (forceScrollRow) {
      this.handleWheel(deltaX, rowHeight * Math.abs(deltaY) / deltaY);
    } else {
      this.handleWheel(deltaX, deltaY)
    }

    if (this.scrollbarX) {
      this.scrollbarX.onWheelScroll(deltaX);
    }
    if (this.scrollbarY) {
      this.scrollbarY.onWheelScroll(deltaY);
    }
  };

  componentDidMount() {
    this.calculateTableWidth();
    this.calculateTableContextHeight();
    this.calculateRowMaxHeight();
    this.setAffixHeaderOffset();
    //延时400ms防抖
    bindElementResize(this.table, _.debounce(this.calculateTableWidth, 400));
    const options = { passive: false };
    this.wheelListener = on(this.tableBody, 'wheel', this.wheelHandler.onWheel, options);
    this.touchStartListener = on(this.tableBody, 'touchstart', this.handleTouchStart, options);
    this.touchMoveListener = on(this.tableBody, 'touchmove', this.handleTouchMove, options);
    this.touchEndListener = on(this.tableBody, 'touchend', this.handleTouchEnd, options)
    const { affixHeader } = this.props;
    if (affixHeader === 0 || affixHeader) {
      this.scrollListener = on(window, 'scroll', this.updateAffixHeaderStatus);
    }
    this.wheelWrapper.onScroll=()=>{
      console.log(111)
      this.scrollY = this.wheelWrapper.scrollTop;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const _cacheChildrenSize = _.flatten(nextProps.children || []).length;
    if (_cacheChildrenSize !== this._cacheChildrenSize) {
      this._cacheChildrenSize = _cacheChildrenSize;
      this._cacheCells = null;
    }
    if (
      this.props.children !== nextProps.children ||
      this.props.sortColumn !== nextProps.sortColumn ||
      this.props.sortType !== nextProps.sortType
    ) {
      this._cacheCells = null;
    }
    return !_.eq(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  componentDidUpdate(prevProps) {
    this.calculateTableContextHeight(prevProps);
    this.calculateTableContentWidth(prevProps);
    this.calculateRowMaxHeight();
    this.updatePosition();
  }

  //卸载监听事件
  componentWillUnmount() {
    this.wheelHandler = null;
    if (this.table) {
      unbindElementResize(this.table);
    }
    if (this.wheelListener) {
      this.wheelListener.off();
    }

    if (this.touchStartListener) {
      this.touchStartListener.off();
    }

    if (this.touchMoveListener) {
      this.touchMoveListener.off();
    }
    if (this.touchEndListener) {
      this.touchEndListener.off();
    }
    if (this.scrollListener) {
      this.scrollListener.off();
    }
  }


  //获取排序状态
  getSortType() {
    const { sortType } = this.props;
    return _.isUndefined(sortType) ? this.state.sortType : sortType;
  }

  getHeaderScrollCellGroups() {
    return this.table.querySelectorAll(`.${this.addPrefix('row-header')} .${this.addPrefix('cell-group-scroll')}`);
  }

  getFixedLeftCellGroups() {
    return this.table.querySelectorAll(`.${this.addPrefix('cell-group-fixed-left')}`);
  }

  getFixedRightCellGroups() {
    return this.table.querySelectorAll(`.${this.addPrefix('cell-group-fixed-right')}`);
  }

  //  获取表头高度
  getTableHeaderHeight() {
    const { headerHeight, showHeader } = this.props;
    return showHeader ? headerHeight : 0;
  }


  // 获取 Table 需要渲染的高度
  getTableHeight() {
    const { contentHeight } = this.state;
    const { minHeight, height, autoHeight, data } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    if (data.length === 0 && autoHeight) {
      return height;
    }
    return autoHeight ? Math.max(headerHeight + contentHeight, minHeight) : height;
  }


  setAffixHeaderOffset = () => {
    const { affixHeader } = this.props;
    if (affixHeader === 0 || affixHeader) {
      this.setState(() => {
        return { affixHeaderOffset: getOffset(this.headerWrapper) };
      });
    }
  };

  updateAffixHeaderStatus = () => {
    const { affixHeader } = this.props;
    const top = typeof affixHeader === 'number' ? affixHeader : 0;
    const { affixHeaderOffset } = this.state;
    const scrollY = window.scrollY || window.pageYOffset;
    const fixedHeader = scrollY - (affixHeaderOffset.top - top) >= 0;
    if (this.affixHeaderWrapper) {
      toggleClass(this.affixHeaderWrapper, 'fixed', fixedHeader);
    }
  };

  //排序函数
  handleSortColumn = (dataKey) => {
    const { onSortColumn, sortColumn } = this.props;
    let sortType = this.getSortType();
    if (sortColumn === dataKey) {
      sortType = sortType === SORT_TYPE.ASC ? SORT_TYPE.DESC : SORT_TYPE.ASC;
      this.setState({ sortType });
    }
    onSortColumn && onSortColumn(dataKey, sortType);
  };


  _cacheCells = null;
  _cacheChildrenSize = 0;

  //获取单元格
  getCells() {

    if (this._cacheCells) {
      return this._cacheCells;
    }

    let left = 0; // Cell left margin
    const headerCells = []; // Table header cell
    const bodyCells = []; // Table body cell
    const children = this.props.children;
    if (!children) {
      this._cacheCells = {
        headerCells,
        bodyCells,
        allColumnsWidth: left
      };
      return this._cacheCells;
    }

    const columns = _.isArray(children) ? children.filter(col => col) : children;
    const { width: tableWidth } = this.state;
    const { sortColumn, rowHeight, showHeader } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    const { totalFlexGrow, totalWidth } = getTotalByColumns(columns);

    React.Children.forEach(columns, (column, index) => {
      if (React.isValidElement(column)) {
        const columnChildren = column.props.children;
        //Column props
        const { width, flexGrow, minWidth, editable, resizable, onResize } = column.props;
        let nextWidth = this.state[`${columnChildren[1].props.dataKey}_${index}_width`] || width || 0;

        if (tableWidth && flexGrow && totalFlexGrow) {
          nextWidth = Math.max(
            ((tableWidth - totalWidth) / totalFlexGrow) * flexGrow,
            minWidth || 80
          );
        }

        const cellProps = {
          ..._.pick(column.props, columnHandledProps),
          left,
          index,
          headerHeight,
          key: index,
          width: nextWidth,
          height: rowHeight,
          firstColumn: index === 0,
          lastColumn: index === columns.length - 1,
          editable: editable
        };


        //渲染表头
        if (showHeader && headerHeight) {
          const headerCellProps = {
            dataKey: columnChildren[1].props.dataKey,
            isHeaderCell: true,
            sortable: column.props.sortable,
            onSortColumn: this.handleSortColumn,
            sortType: this.getSortType(),
            sortColumn,
            flexGrow
          };

          if (resizable) {
            _.merge(headerCellProps, {
              onResize,
              onColumnResizeEnd: this.handleColumnResizeEnd,
              onColumnResizeStart: this.handleColumnResizeStart,
              onColumnResizeMove: this.handleColumnResizeMove
            });
          }

          headerCells.push(
            React.cloneElement(columnChildren[0], {
              ...cellProps,
              ...headerCellProps
            })
          );
        }

        bodyCells.push(React.cloneElement(columnChildren[1], cellProps));
        left += nextWidth;
      }
    });

    this._cacheCells = {
      headerCells,
      bodyCells,
      allColumnsWidth: left
    };
    return this._cacheCells;
  }


  handleScrollX = (delta) => {
    //判断是否到滑动
    if (this.scrollX) this.setState({ MoreX: false })
    else this.setState({ MoreX: true })
    this.handleWheel(delta, 0);
  };

  handleScrollY = (deltaY) => {
    const { height, scrollToEnd, loading, headerHeight } = this.props;
    if (deltaY >= Math.floor(this.state.contentHeight-height+headerHeight)) {
      !loading && scrollToEnd && scrollToEnd()
    }
  };



  handleWheel = (deltaX) => {
    const { onScroll, virtualized } = this.props;
    if (!this.table) {
      return;
    }
    const nextScrollX = this.scrollX - deltaX;
    this.scrollX = Math.min(0, nextScrollX < this.minScrollX ? this.minScrollX : nextScrollX);
    
    this.updatePosition();

    //回调函数
    onScroll && onScroll(this.scrollX, this.scrollY);
    if (virtualized) {
      this.setState({ scrollY:this.wheelWrapper.scrollTop });
    }
  };

  // 处理移动端 Touch 事件,  Start 的时候初始化 x,y
  handleTouchStart = (event) => {
    clearInterval(this.timer)
    const { onTouchStart } = this.props;
    const { pageX, pageY } = event.touches ? event.touches[0] : {};
    this.touchX = pageX;
    this.touchY = pageY;
    this.startX = pageX;
    this.startY = pageY;
    this.timestamp = new Date().getTime()
    onTouchStart && onTouchStart(event);
  };

  // 处理移动端 Touch 事件, Move 的时候初始化，更新 scroll
  handleTouchMove = (event) => {
    const { onTouchMove, autoHeight, disabledScroll } = this.props;
    const { pageX: nextPageX, pageY: nextPageY } = event.touches ? event.touches[0] : {};
    let detx = this.touchX - nextPageX;
    let dety = this.touchY - nextPageY;
    const deltaX = detx;
    const deltaY = autoHeight ? 0 : dety;
    //防止同时 左右 上下 滑造成表格抖动
    if (Math.abs(dety) >= Math.abs(detx) || !event.cancelable) {
      if (!disabledScroll) {
        this.scrollbarY.onWheelScroll(deltaY);
      }
    } else {
      event.preventDefault();
      this.handleScrollX(deltaX);
      if (!disabledScroll) {
        this.scrollbarX.onWheelScroll(deltaX);
      }
    }
    this.touchX = nextPageX;
    this.touchY = nextPageY;
    onTouchMove && onTouchMove(event);
  };

  //处理touch 结束 惯性滑动
  handleTouchEnd = (event) => {
    const { pageX, pageY } = event.changedTouches[0];
    let deltaX = (this.startX - pageX);
    let deltaY = (this.startY - pageY);
    //防止同时左右、上下滑，造成用户体验不适
    if (Math.abs(deltaX) > Math.abs(deltaY) && event.cancelable) {
      event.preventDefault();
      let time = new Date().getTime() - this.timestamp
      let speed = deltaX / 6
      if (time < 300) {
        this.timer = setInterval(() => {
          if (Math.abs(speed) < 0.5) clearInterval(this.timer)
          this.handleScrollX(speed);
          this.touchX = this.touchX - speed;
          speed = speed - Math.abs(speed) * 0.5 / speed;
        }, 10);
      }
    }
  }

  updatePosition() {
    if (this.state.shouldFixedColumn) {
      this.updatePositionByFixedCell();
    } else {
      const wheelStyle = {};
      const headerStyle = {};
      this.translateDOMPositionXY(wheelStyle, this.scrollX, 0);
      this.translateDOMPositionXY(headerStyle, this.scrollX, 0);
      this.wheelWrapper && addStyle(this.wheelWrapper, wheelStyle);
      this.headerWrapper && addStyle(this.headerWrapper, headerStyle);
    }
    if (this.tableHeader) {
      toggleClass(this.tableHeader, this.addPrefix('cell-group-shadow'), this.scrollY < 0);
    }
  }

  updatePositionByFixedCell() {
    const wheelGroupStyle = {};
    const wheelStyle = {};
    const fixedLeftGroups = this.getFixedLeftCellGroups();
    const fixedRightGroups = this.getFixedRightCellGroups();
    const { contentWidth, width } = this.state;
    this.translateDOMPositionXY(wheelGroupStyle, this.scrollX, 0);
    this.translateDOMPositionXY(wheelStyle, 0, 0);
    const scrollGroups = this.getHeaderScrollCellGroups();
    const scrollArrayGroups = Array.from(scrollGroups);
    for (let i = 0; i < scrollArrayGroups.length; i++) {
      let group = scrollArrayGroups[i];
      addStyle(group, wheelGroupStyle);
    }

    if (this.wheelWrapper) {
      addStyle(this.wheelWrapper, wheelStyle);
    }

    addStyle(this.scrollContent, wheelGroupStyle)
    //样式
    const leftShadowClassName = this.addPrefix('cell-group-left-shadow');
    const rightShadowClassName = this.addPrefix('cell-group-right-shadow');
    const showLeftShadow = this.scrollX < 0;
    const showRightShadow = width - contentWidth - SCROLLBAR_WIDTH !== this.scrollX;

    toggleClass(fixedLeftGroups, leftShadowClassName, showLeftShadow);
    toggleClass(fixedRightGroups, rightShadowClassName, showRightShadow);
  }

  shouldHandleWheelX = (delta) => {
    const { disabledScroll, loading } = this.props;
    const { contentWidth, width } = this.state;
    if (delta === 0 || disabledScroll || loading) {
      return false;
    }

    if (width && contentWidth <= width) {
      return false;
    }

    return (delta >= 0 && this.scrollX > this.minScrollX) || (delta < 0 && this.scrollX < 0);
  };

  shouldHandleWheelY = (delta) => {
    const { disabledScroll, loading } = this.props;
    if (delta === 0 || disabledScroll || loading) {
      return false;
    }
    return (delta >= 0 && this.scrollY > this.minScrollY) || (delta < 0 && this.scrollY < 0);
  };


  tableRows = {};
  mounted = false;
  scrollY = 0;
  scrollX = 0;
  addPrefix = (name) => prefix(this.props.classPrefix)(name);

  //计算行高
  calculateRowMaxHeight() {
    const { wordWrap } = this.props;
    if (wordWrap) {
      const tableRowsMaxHeight = [];
      const tableRows = Object.entries(this.tableRows);
      for (let i = 0; i < tableRows.length; i++) {
        let [, row] = tableRows[i];
        if (row) {
          let cells = row.querySelectorAll(`.${this.addPrefix('cell-wrap')}`) || [];
          let maxHeight = 0;
          let cellArray = Array.from(cells);
          for (let j = 0; j < cellArray.length; j++) {
            let cell = cellArray[j];
            let h = getHeight(cell);
            maxHeight = Math.max(maxHeight, h);
          }
          tableRowsMaxHeight.push(maxHeight);
        }
      }
      this.setState({ tableRowsMaxHeight });
    }
  }

  //计算表格宽度
  calculateTableWidth = () => {
    const table = this.table;
    const { width } = this.state;
    if (table) {
      const nextWidth = getWidth(table);
      if (width !== nextWidth) {
        this.scrollX = 0;
        this.scrollbarX && this.scrollbarX.resetScrollBarPosition();
      }
      this._cacheCells = null;
      this.setState({
        width: nextWidth
      });
    }
  };

  //计算表格内容宽度
  calculateTableContentWidth(prevProps) {
    const { width } = this.state;
    const { allColumnsWidth } = this.getCells();
    const contentWidth = allColumnsWidth > width ? allColumnsWidth : width;
    this.setState({ contentWidth });
    // 这里 -SCROLLBAR_WIDTH 是为了让滚动条不挡住内容部分
    this.minScrollX = -(contentWidth - this.state.width); //- SCROLLBAR_WIDTH;

    /**
     * 1.判断 Table 列数是否发生变化
     * 2.判断 Table 内容区域是否宽度有变化
     * 满足 1 和 2 则更新横向滚动条位置
     */
    if (
      _.flatten(this.props.children).length !== _.flatten(prevProps.children).length &&
      this.state.contentWidth !== contentWidth
    ) {
      this.scrollLeft(0);
    }
  }

  //计算表格内容高度
  calculateTableContextHeight(prevProps) {
    const rows = this._rows || [];
    const { height, autoHeight, rowHeight, affixHeader } = this.props;
    const headerHeight = affixHeader ? this.getTableHeaderHeight() * 2 : this.getTableHeaderHeight();
    const contentHeight = rows.length
      ? Array.from(rows)
        .map(row => rowHeight)
        .reduce((x, y) => x + y)
      : 0;
    const nextContentHeight = contentHeight;
    this.setState({ contentHeight: nextContentHeight });
    // 当 data 更新，或者表格高度更新，则更新滚动条
    if (prevProps && (prevProps.height !== height || prevProps.data !== this.props.data) && this.scrollY !== 0) {
      this.scrollTop(Math.abs(this.scrollY) + prevProps.height - headerHeight);
      this.updatePosition();
    }

    if (!autoHeight) {
      // 这里 -SCROLLBAR_WIDTH 是为了让滚动条不挡住内容部分
      this.minScrollY = -(contentHeight - height) - (this.props.disabledScroll ? 0 : SCROLLBAR_WIDTH);
    }
  }

  /*
   * public method
   * top 值是表格理论滚动位置的一个值，通过 top 计算出 scrollY 坐标值与滚动条位置的值
   */
  scrollTop = (top = 0) => {
    const { height, headerHeight } = this.props;
    const { contentHeight } = this.state;
    const scrollY = Math.max(0, top - (height - headerHeight));
    this.scrollY = -scrollY;
    if (this.scrollbarY) {
      let y = 0;
      if (top !== 0) {
        // 滚动条的高度
        const scrollbarHeight = Math.max(((height - headerHeight) / (contentHeight + SCROLLBAR_WIDTH)) * (height - headerHeight), SCROLLBAR_MIN_WIDTH);
        y = Math.max(0, (top / (contentHeight + SCROLLBAR_WIDTH)) * (height - headerHeight) - scrollbarHeight);
      }
      this.scrollbarY.resetScrollBarPosition(y);
    }
    this.setState({
      scrollY: -scrollY
    });
  };

  // public method
  scrollLeft = (left = 0) => {
    this.scrollX = -left;
    this.scrollbarX && this.scrollbarX.resetScrollBarPosition(left);
    this.updatePosition();
  };

  bindTableRowsRef = (index) => (ref) => {
    if (ref) {
      this.tableRows[index] = ref;
    }
  };

  bindMouseAreaRef = (ref) => {
    this.mouseArea = ref;
  };

  bindTableHeaderRef = (ref) => {
    this.tableHeader = ref;
  };

  bindHeaderWrapperRef = (ref) => {
    this.headerWrapper = ref;
  };

  bindAffixHeaderRef = (ref) => {
    this.affixHeaderWrapper = ref;
  };

  bindTableRef = (ref) => {
    this.table = ref;
  };

  bindWheelWrapperRef = (ref) => {
    const { bodyRef } = this.props;
    this.wheelWrapper = ref;
    bodyRef && bodyRef(ref);
  };

  bindBodyRef = (ref) => {
    this.tableBody = ref;
  };

  bindScrollbarXRef = (ref) => {
    this.scrollbarX = ref;
  };

  bindScrollbarYRef = (ref) => {
    this.scrollbarY = ref;
  };

  bindRowClick = (rowData) => {
    const { onRowClick } = this.props;
    return (event) => {
      onRowClick && onRowClick(rowData, event);
    };
  };

  renderRowData(bodyCells, rowData, props) {
    const { rowKey, wordWrap } = this.props;
    const nextRowKey = typeof rowData[rowKey] !== 'undefined' ? rowData[rowKey] : props.index;

    const rowProps = {
      rowRef: this.bindTableRowsRef(props.index),
      onClick: this.bindRowClick(rowData),
      key: props.index,
      width: props.rowWidth,
      height: props.rowHeight,
      top: props.top
    };

    const cells = [];

    for (let i = 0; i < bodyCells.length; i++) {
      let cell = bodyCells[i];
      cells.push(
        React.cloneElement(cell, {
          rowData,
          wordWrap,
          height: props.rowHeight,
          rowIndex: props.index,
          depth: props.depth,
          rowKey: nextRowKey,
        })
      );
    }

    return this.renderRow(rowProps, cells, rowData);
  }

  renderRowVer2(bodyCells, rowData, props) {
    const { rowKey, wordWrap } = this.props;
    const nextRowKey = typeof rowData[rowKey] !== 'undefined' ? rowData[rowKey] : props.index;
    const rowProps = {
      rowRef: this.bindTableRowsRef(props.index),
      onClick: this.bindRowClick(rowData),
      key: props.index,
      width: props.rowWidth,
      height: props.rowHeight,
      top: props.top
    };
    const cells = [];
    for (let i = 0; i < bodyCells.length; i++) {
      let cell = bodyCells[i];
      cells.push(
        React.cloneElement(cell, {
          rowData,
          wordWrap,
          height: props.rowHeight,
          rowIndex: props.index,
          depth: props.depth,
          rowKey: nextRowKey,
        })
      );
    }
    return this.renderFullContent(rowProps, cells, rowData)
  }

  //渲染表格行
  renderRow(props, cells, rowData) {
    const { rowClassName } = this.props;
    const { shouldFixedColumn, width } = this.state;
    if (typeof rowClassName === 'function') {
      props.className = rowClassName(rowData);
    } else {
      props.className = rowClassName;
    }
    // 将固定列push进数组
    if (shouldFixedColumn) {
      let fixedLeftCells = [];
      let fixedRightCells = [];
      let scrollCells = [];
      let fixedLeftCellGroupWidth = 0;
      let fixedRightCellGroupWidth = 0;
      for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        const { fixed, width } = cell.props;
        if (fixed === true || fixed === 'left') {
          fixedLeftCells.push(cell);
          fixedLeftCellGroupWidth += width;
        } else if (fixed === 'right') {
          fixedRightCells.push(cell);
          fixedRightCellGroupWidth += width;
        } else {
          scrollCells.push(cell);
        }
      }
      return (
        <Row {...props}>
          {fixedLeftCellGroupWidth ? (
            <CellGroup
              fixed="left"
              height={props.isHeaderRow ? props.headerHeight : props.height}
              width={fixedLeftCellGroupWidth}
            >
              {fixedLeftCells}
            </CellGroup>
          ) : null}

          <CellGroup>
            {scrollCells}
          </CellGroup>

          {fixedRightCellGroupWidth ? (
            <CellGroup
              fixed="right"
              style={
                { left: width - fixedRightCellGroupWidth - SCROLLBAR_WIDTH }
              }
              height={props.isHeaderRow ? props.headerHeight : props.height}
              width={fixedRightCellGroupWidth}
            >
              {resetLeftForCells(fixedRightCells)}
            </CellGroup>
          ) : null}
        </Row>
      );
    } else {
      return (
        <Row {...props}>
          <CellGroup>{cells}</CellGroup>
        </Row>
      );
    }
  }



  //渲染表头
  renderTableHeader(headerCells, rowWidth) {
    const { rowHeight, affixHeader, showArrow } = this.props;
    const { width: tableWidth } = this.state;
    const top = typeof affixHeader === 'number' ? affixHeader : 0;
    const headerHeight = this.getTableHeaderHeight();
    const rowProps = {
      rowRef: this.bindTableHeaderRef,
      width: rowWidth,
      height: rowHeight,
      headerHeight,
      isHeaderRow: true,
      top: 0
    };
    const fixedStyle = {
      position: 'fixed',
      overflow: 'hidden',
      height: this.getTableHeaderHeight(),
      width: tableWidth,
      top
    };


    // Affix header
    const header = (
      <div
        className={classNames(this.addPrefix('affix-header'))}
        style={fixedStyle}
        ref={this.bindAffixHeaderRef}
      >
        {this.renderRow(rowProps, headerCells)}
      </div>
    );

    return (
      <React.Fragment>
        {(affixHeader === 0 || affixHeader) && header}
        <div className={this.addPrefix('header-row-wrapper')} ref={this.bindHeaderWrapperRef}>
          {rowWidth - tableWidth > 0 && showArrow && this.state.MoreX ? <div
            style={{
              position: 'absolute',
              right: 0,
              zIndex: 1,
              height: headerHeight,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <i style={{ width: 10 }}><img src={require('./dist/triangle_right.svg')} alt='' /></i>
          </div> : ''}

          {this.renderRow(rowProps, headerCells)}
        </div>
      </React.Fragment>
    );
  }



  renderFullContent(props, cells, rowData) {
    const { rowClassName } = this.props;
    const { width } = this.state;
    if (typeof rowClassName === 'function') {
      props.className = rowClassName(rowData);
    } else {
      props.className = rowClassName;
    }

    let fixedLeftCells = [];
    let fixedRightCells = [];
    let scrollCells = [];
    let fixedLeftCellGroupWidth = 0;
    let fixedRightCellGroupWidth = 0;

    for (let i = 0; i < cells.length; i++) {
      let cell = cells[i];
      const { fixed, width } = cell.props;
      if (fixed === true || fixed === 'left') {
        fixedLeftCells.push(cell);
        fixedLeftCellGroupWidth += width;
      } else if (fixed === 'right') {
        fixedRightCells.push(cell);
        fixedRightCellGroupWidth += width;
      } else {
        scrollCells.push(cell);
      }
    }
    this.renderScrollContent = () => {
      return (
        <Row {...props}>
          <CellGroup>
            {scrollCells}
          </CellGroup>
        </Row>
      );
    }

    this.renderLeftFixedContent = () => {
      return fixedLeftCells.length !== 0 && <Row {...props}>
        <CellGroup
          fixed="left"
          height={props.isHeaderRow ? props.headerHeight : props.height}
          width={fixedLeftCellGroupWidth}
        >
          {fixedLeftCells}
        </CellGroup>
      </Row>
    }

    this.renderRightFixedContent = () => {
      return fixedRightCells.length !== 0 && <Row {...props}>
        <CellGroup
          fixed="right"
          style={
            { left: width - fixedRightCellGroupWidth - SCROLLBAR_WIDTH }
          }
          height={props.isHeaderRow ? props.headerHeight : props.height}
          width={fixedRightCellGroupWidth}
        >
          {resetLeftForCells(fixedRightCells)}
        </CellGroup>
      </Row>
    }
    return this
  }

  handleWheelScroll=(e)=>{
    this.scrollY = e.target.scrollTop;
    this.handleScrollY(e.target.scrollTop)
    this.setState({scrollY:this.scrollY})
  }


  //渲染表体
  renderTableBody(bodyCells, rowWidth) {
    const {
      rowHeight,
      setRowHeight,
      wordWrap,
      virtualized,
      autoHeight,
      preLoad=2
    } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    const { tableRowsMaxHeight, data, contentHeight } = this.state;
    const height = this.props.height || this.getTableHeight();
    const bodyStyles = {
      top: headerHeight,
      height: autoHeight ? contentHeight : (height - headerHeight),
      minHeight: height - headerHeight
    };
    let top = 0; // Row position
    let bottomHideHeight = 0
    this._rows = [];
    this.leftContent = [];
    this.scrollContent = [];
    this.rightContent = [];
    if (data) {
      const minTop = Math.abs(this.scrollY);
      const maxTop = minTop + height;
      for (let index = 0; index < data.length; index++) {
        let rowData = data[index];
        let maxHeight = tableRowsMaxHeight[index];
        let nextRowHeight = maxHeight ? maxHeight + CELL_PADDING_HEIGHT : rowHeight;
        let depth = 0;

        if (setRowHeight) {
          nextRowHeight = setRowHeight(rowData) || rowHeight;
        }

        let rowProps = {
          index,
          top,
          rowWidth,
          depth,
          rowHeight: nextRowHeight
        };
        this._rows.push(this.renderRowData(bodyCells, rowData, rowProps));
        top += nextRowHeight;
        //虚拟化，不在显示范围内则跳过push
        if (virtualized && !wordWrap) {
          if (top + nextRowHeight*(preLoad) < minTop) {
            continue;
          } else if (top-preLoad*nextRowHeight > maxTop) {
            bottomHideHeight += nextRowHeight;
            continue;
          }
        }
        
        let tmp = this.renderRowVer2(bodyCells, rowData, rowProps)
        tmp.renderLeftFixedContent() && this.leftContent.push(tmp.renderLeftFixedContent());
        this.scrollContent.push(tmp.renderScrollContent());
        tmp.renderRightFixedContent() && this.rightContent.push(tmp.renderRightFixedContent());
      }
    }

    const wheelStyles = {
      height: autoHeight ? ('100%') : (height - headerHeight),
    };
    const bottomRowStyles = { height: bottomHideHeight };
    const mainContentStyles={height:height+this.scrollY,maxHeight:contentHeight}
    return (
      <div
        ref={this.bindBodyRef}
        className={this.addPrefix('body-row-wrapper')}
        style={bodyStyles}
        onScroll={this.handleBodyScroll}
      >
        <div
          style={wheelStyles}
          className={this.addPrefix('body-wheel-area')}
          ref={this.bindWheelWrapperRef}
          onScroll={this.handleWheelScroll}
        >

          <div className={this.addPrefix("mainContent")} style={mainContentStyles} >
            {this.leftContent.length != 0 && <div className={this.addPrefix("leftFixed")}>{this.leftContent}</div>}
            <div className={this.addPrefix("scrollContent")} ref={(ref) => this.scrollContent = ref}>{this.scrollContent}</div>
            {this.rightContent.length !== 0 && <div className={this.addPrefix("rightFixed")}>{this.rightContent}</div>}
          </div>
          {bottomHideHeight ? (
            <Row
              style={bottomRowStyles}
              className="virtualized"
              updatePosition={this.translateDOMPositionXY}
            />
          ) : null}
        </div>
        {this.renderInfo()}
        {this.renderScrollbar()}
        {this.renderLoading()}
      </div>
    );
  }

  //渲染无数据提示语..
  renderInfo() {
    const { locale, renderEmpty, loading } = this.props;
    if (this._rows.length || loading) {
      return null;
    }

    const emptyMessage = <div className={this.addPrefix('body-info')}>{locale.emptyMessage}</div>;
    return renderEmpty ? renderEmpty(emptyMessage) : emptyMessage;
  }

  renderScrollbar() {
    const { disabledScroll, rowHeight, forceScrollRow } = this.props;
    const { contentWidth, contentHeight } = this.state;
    const headerHeight = this.getTableHeaderHeight();
    const height = this.getTableHeight();

    if (disabledScroll) {
      return null;
    }

    return (
      <div>
        <Scrollbar
          length={this.state.width}
          onScroll={this.handleScrollX}
          scrollLength={contentWidth}
          ref={this.bindScrollbarXRef}
        />
        <Scrollbar
          vertical
          length={height - headerHeight}
          scrollLength={contentHeight}
          onScroll={this.handleScrollY}
          ref={this.bindScrollbarYRef}
          forceScrollHeight={forceScrollRow && rowHeight}
        />
      </div>
    );
  }

  //渲染加载
  renderLoading() {
    const { locale, loading, loadAnimation, renderLoading } = this.props;

    if (!loadAnimation && !loading) {
      return null;
    }

    const loadingElement = (
      <div className={this.addPrefix('loader-wrapper')}>
        <div className={this.addPrefix('loader')}>
          <i className={this.addPrefix('loader-icon')} />
          <span className={this.addPrefix('loader-text')}>{locale.loading}</span>
        </div>
      </div>
    );

    return renderLoading ? renderLoading(loadingElement) : loadingElement;
  }

  render() {
    const {
      children,
      className,
      width = 0,
      style,
      hover,
      bordered,
      cellBordered,
      wordWrap,
      classPrefix,
      loading,
      showHeader,
    } = this.props;
    const { contentWidth } = this.state;
    const { isColumnResizing } = this.state;
    const { headerCells, bodyCells } = this.getCells();

    const clesses = classNames(classPrefix, className, {
      [this.addPrefix('word-wrap')]: wordWrap,
      [this.addPrefix('bordered')]: bordered,
      [this.addPrefix('cell-bordered')]: cellBordered,
      [this.addPrefix('hover')]: hover,
      [this.addPrefix('loading')]: loading,
      [this.addPrefix('column-resizing')]: isColumnResizing,
    });

    const styles = {
      width: width || 'auto',
      height: this.getTableHeight(),
      ...style
    };
    return (
      <div className={clesses} style={styles} ref={this.bindTableRef}>
        {showHeader && this.renderTableHeader(headerCells, contentWidth)}
        {children && this.renderTableBody(bodyCells, contentWidth)}
      </div>
    );
  }
}

export default Table;
