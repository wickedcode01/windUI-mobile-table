# WindUI-mobile/table

## example

``` javascript
import Table from './index.js'
const col = [{
    title: '标题',
    dataIndex: 'name'
}, {
    title: '价格',
    dataIndex: 'value'
}]
let data = [{
        name: 'test',
        value: '1000'
    }, {
        name: 'test',
        value: '1000'
    }] <
    Table columns = {
        col
    }
data = {
    data
}
/> 
```

## api

### table

| Property                 | Type `(Default)` | Description                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| affixHeader              | boolean, number                                                                    | fixed header (top is the postion)                                  |
| autoHeight               | boolean                                                                           | autoHeight                                                                               |
| bodyRef                  | (ref: HTMLElement) => void                                                        | A ref                                                      |
| bordered                 | boolean                                                                           | Show border                                                            |
| data                    | object[]                                                                          | Tabledata                                                                                    |
| columns | object[]|columns config|
| headerHeight             | number `(40)` | Table Header Height                                                                           |
| height                   | number `(200)` | Table height                                                                                  |
| hover                    | boolean `(true)` | The row of the table has a mouseover effect                                                   |
| loading                  | boolean                                                                           | Show loading                                                                                  |
| locale                   | object: { emptyMessage: `('No data')` , loading: `('Loading...')` }                | Messages for empty data and loading states                                                    |
| minHeight                | number `(0)` | Minimum height                                                                                |
| onRowClick               | (rowData:object, event: SyntheticEvent)=>void                                     | Click the callback function after the row and return to `rowDate` |
| onScroll                 | (scrollX:object, scrollY:object)=>void                                            | Callback function for scroll bar scrolling                                                    |
| onSortColumn             | (dataKey:string, sortType:string)=>void                                           | Click the callback function of the sort sequence to return the value `sortColumn` , `sortType` |
| renderEmpty              | (info: React. ReactNode) => React. ReactNode                                        | Customized data is empty display content                                                      |
| renderLoading            | (loading: React. ReactNode) => React. ReactNode                                     | Customize the display content in the data load                                                |
| rowClassName             | string , (rowData:object)=>string                                                 | Add an optional extra class name to row                                                       |
| rowHeight                | number `(46)` , (rowData: object) => number                                         | Row height                                                                                    |
| rowKey                   | string `('key')` | Each row corresponds to the unique `key` in `data` |
| showHeader               | boolean `(true)` | Display header                                                                                |
| virtualized              | boolean                                                                           | virtualized render large data                                                         |
| width                    | number                                                                            | Table width                                                                                   |
|autoIndex|boolean `(false)` |auto-increment oreder|
|selectable|(selectedKeys)=>void `(false)` |rows can be selected |
|editable|||

### columns
| Property  |  Type `(Default)` |  Description  |
| ------------ | ------------ | ------------ |
|  title | string  | the title of table header  |
| key  | string  | the unique  key of each column, you can ignore it when you set `dataIndex` |
|  dataIndex | string  | Display field of the data record  |
| align  |enum: 'left', 'center', 'right' `(left)` |  The specify which way that column is aligned |
| verticalAlign  | enum: 'top', 'middle', 'bottom' `(middle)` |  Vertical alignment |
|  sortable | boolean  |which can sort |
| resizable  | boolean  |  Customizable Resize Column width |
| minWidth  | number  |  minimum width |
| fixed  | enum: 'left', 'right'  | Fixed column  |
|flexGrow|number|Set the column width automatically adjusts, when you don't want you table scroll you can use it|
