import React, { Component } from 'react';
import TableInner from './Table';
import Column from './Column';
import Cell from './Cell.js'
import HeaderCell from './HeaderCell';
import './less/index.less'
import _ from 'lodash'
class index extends Component {
  state = { col: '', input: false, checkedList: [] };
  render() {
    let { columns = [], data, onSortColumn, autoIndex, selectable, transpose, ...rest } = this.props;
    const { checkedList } = this.state;

    let transData = []
    let transColumn = []
    let dist = _.filter(columns, (data) => data.dataIndex)
    data.forEach((data, index) => {
      transColumn.push({ title: index + 1, dataIndex: index })
    })
    dist.forEach((key, index) => {
      let title = key.title
      let obj = {}
      obj[0] = title
      data.forEach((data, idx) => {
        obj[idx + 1] = data[key.dataIndex]
      })
      transData.push(obj)

    })





    return (
      <div>
        <TableInner
          {...rest}
          sortColumn={this.state.col}
          data={transpose ? transData : data}
          onSortColumn={(key, type) => {
            onSortColumn && onSortColumn(key, type);
            this.setState({ col: key });
          }}
          shouldFixedColumn={columns.some((val) => val.fixed)}
        >
          {!transpose&&selectable && <Column fixed key="-2">
            <HeaderCell><input type="checkbox" onChange={e => {
              let checkedList = e.target.checked ? data.map((data, index) => index) : []
              this.setState({ checkedList })
              if (typeof (selectable) === 'function') {
                selectable(checkedList)
              }
            }} /></HeaderCell>
            <Cell onClick={e => e.stopPropagation()} >{(data, index) => {
              return <input type="checkbox" index={index} checked={checkedList.indexOf(index) >= 0} onChange={(e) => {
                e.target.checked ? checkedList.push(index) : _.remove(checkedList, (val) => val === index)
                this.setState({ checkedList })
                if (typeof (selectable) === 'function') {
                  selectable(checkedList)
                }
              }} />
            }}</Cell>
          </Column>}
          {autoIndex && <Column fixed key="-1">
            <HeaderCell>序号</HeaderCell>
            <Cell>{(data, index) => index + 1}</Cell>
          </Column>}
          {(transpose ? transColumn : columns).map((data, index) => {
            const { dataIndex, key, title, render, type, digit, style } = data;
            return (
              <Column {...data} key={key ? key : dataIndex || index}>
                <HeaderCell>{title}</HeaderCell>
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
