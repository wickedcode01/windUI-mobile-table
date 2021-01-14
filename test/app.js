import React, { Component } from 'react'
import Table from '../src/index'
export default class app extends Component {
    state={data:[ {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},
    {name:'3123123','b':'asdsadas','c':'121231'},]}
    render() {
        const columns=[
            {title:'名称',dataIndex:'name',fixed:'left'},
            {title:'a',dataIndex:'a',sortable:true},
            {title:'b',dataIndex:'b'},
            {title:'c',dataIndex:'c'},
            {title:'d',dataIndex:'d'},
            {title:'e',dataIndex:'e'},
            {title:'f',dataIndex:'f'},
            {title:'g',dataIndex:'g'},
            {title:'大卫天龙',dataIndex:'id'},
            {title:'g',dataIndex:'g'},
            {title:'g',dataIndex:'g'},
        ]
      
        return (
            <div>
                <Table columns={columns} data={this.state.data} virtualized  height={500} onSortColumn={(val,key)=>console.log(val,key)} />
            </div>
        )
    }
}
