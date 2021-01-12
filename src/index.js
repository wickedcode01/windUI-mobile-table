import React, { Component } from 'react';
import TableInner from './Table';
import Column from './Column';
import Cell from './Cell.js'
import HeaderCell from './HeaderCell';
import './less/index.less'
class index extends Component {
  state = { col: '', input: false, checkedList: [] };
  render() {
    let { columns = [], data, onSortColumn, autoIndex, selectable, ...rest } = this.props;
    return (
      <div>
        <TableInner
          {...rest}
          sortColumn={this.state.col}
          data={ data}
          onSortColumn={(key, type) => {
            onSortColumn && onSortColumn(key, type);
            this.setState({ col: key });
          }}
          shouldFixedColumn={columns.some((val) => val.fixed)}
        >
          {columns.map((data, index) => {
            const { dataIndex, key, title, render, type, digit, style } = data;
            return (
              <Column {...data} key={index} >
                <HeaderCell Key={key}>{title}</HeaderCell>
                <Cell dataKey={dataIndex} type={type} digit={digit} style={style} >
                  {render ? (rowdata) => render(dataIndex ? rowdata[dataIndex] : rowdata) : undefined}
                </Cell>
              </Column>
            );
          })}
        </TableInner>
      </div>
    );
  }
}

export default index;
