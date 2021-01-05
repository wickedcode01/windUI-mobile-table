import React, { Component } from 'react';
import TableInner from './Table';
import Column from './Column';
import Cell from './Cell.js'
import HeaderCell from './HeaderCell';
import './less/index.less'
class index extends Component {
  state = { col: '' };
  render() {
    const { columns = [], onChange, ...rest } = this.props;
    return (
      <div>
        <TableInner
          {...rest}
          sortColumn={this.state.col}
          onSortColumn={(key, type) => {
            onChange && onChange(key, type);
            this.setState({ col: key });
          }}
        >
          {columns.map(data => {
            const { dataIndex, key, title, render } = data;
            return (
              <Column {...data} key={key ? key : dataIndex}>
                <HeaderCell>{title}</HeaderCell>
                <Cell dataKey={dataIndex}>
                  {render?(rowdata)=>render(dataIndex ? rowdata[dataIndex] : rowdata):null}
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
