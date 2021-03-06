import React, { Component } from 'react'
import { NavBar, Icon, ListView, PullToRefresh, ActivityIndicator } from 'antd-mobile'
import { connect } from 'dva'
import DoneItem from './DoneItem'

function MyBody(props) {
  return (
    <div onTouchMove={e=>e.stopPropagation()} >
      {props.children}
    </div>
  )
}

@connect( state=>({
  driver_id: state.driver_login.driver_id,
  orderType: state.orderType.data,
  loading: state.courierDone.loading,
  data: state.courierDone.data
}) )
export default class Done extends Component {

  constructor(props){
    super(props)
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    this.state={
      dataSource,
      refreshing: false,
      pageNo: 1,
      pageSize: 20,
      data: []
    }
    this.data = []
  }

  componentDidMount(){
    if ( this.props.orderType.length===0 ) {
      this.props.dispatch({
        type: 'orderType/getData'
      })
    }
    // 发送获取快递员以完成订单的请求
    this.props.dispatch({
      type: 'courierDone/getData',
      payload: {
        couId: this.props.driver_id,
        pageNo: this.state.pageNo,
        pageSize: this.state.pageSize,
        refreshing: false
      }
    })
  }

  componentWillReceiveProps(nextProps){
    if ( this.props.data !== nextProps.data ) {
      this.setState({
        refreshing: false
      })
      let arr = this.data.slice()
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(arr.concat(nextProps.data)),
        data: arr.concat(nextProps.data)
      })
    }
  }

  onRefresh=e=> {
    this.data = []
    this.setState({
      refreshing: true,
      pageNo: 1,
      pageSize: 20
    })
    this.props.dispatch({
      type: 'courierDone/refresh',
      payload: {
        couId: this.props.driver_id,
        pageNo: 1,
        pageSize: 20
      }
    })
  }

  render(){
    const row = (item)=>(
      <DoneItem data={item} orderType={this.props.orderType} />
    )
    return <div>
      <NavBar
        icon={ <Icon type='left' ></Icon> }
        onLeftClick={ ()=>this.props.history.goBack() }
      >送单统计</NavBar>
      <ListView
        initialListSize={20}
        style={{height: document.documentElement.clientHeight-45,
          backgroundColor: '#f1f1f1',
          width: document.documentElement.clientWidth}}
        renderBodyComponent={() => <MyBody />}
        dataSource={this.state.dataSource}
        renderRow={row}
        renderHeader={ ()=> <div style={{display: 'flex',
          justifyContent: 'center', paddingTop: 10}} >
          <ActivityIndicator animating={this.props.loading} ></ActivityIndicator>
        </div> }
        pullToRefresh={
          <PullToRefresh
            refreshing={this.state.refreshing}
            onRefresh={this.onRefresh}
          />}
      />
    </div>
  }
}
