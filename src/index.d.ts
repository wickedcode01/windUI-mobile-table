import React, { SyntheticEvent } from "react";
interface Props {
  virtualized?: boolean;
  data: Array<object>;
  columns:Array<object>;
  loading?:boolean;
  height?:number;
  autoHeight?:boolean;
  bordered?:boolean;
  headerHeight?:number;
  affixHeader?:boolean|number;
  bodyRef?:(ref:HTMLElement)=>void;
  hover?:boolean;
  locale?:{emptyMessage:string,loading:string};  
  onSortColumn?:(dataKey:string,sortType:string)=>void;
  disabledScroll?:boolean;
  showHeader?:boolean;
  rowHeight?:number;
  style?:object;
  scrollToEnd?:()=>void;
  hideShadow?:boolean;
  onRowClick?:(rowData:object,event:SyntheticEvent)=>void
}

export default class Table extends React.Component<Props, any> {
    render(): JSX.Element;
}
