// - Import react components
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Route, Switch, NavLink, withRouter} from 'react-router-dom'
import {firebaseAuth, firebaseRef} from 'app/firebase/'
import {push} from 'react-router-redux'
import { Progress, Message} from 'semantic-ui-react'


// - Import components
import Home from 'Home'
import Signup from 'Signup'
import Login from 'Login'
import Admin from 'Admin'
import BlogHeader from 'BlogHeader'
import MasterLoading from 'MasterLoading'
import Fimg from 'Fimg'
import * as types from 'actionTypes'


// - Import API
import {PrivateRoute, PublicRoute} from 'AuthRouterAPI'


// - Import actions
import * as authorizeActions from 'authorizeActions'
import * as imageGalleryActions from 'imageGalleryActions'
import * as postActions from 'postActions'
import * as commentActions from 'commentActions'
import * as userActions from 'userActions'
import * as globalActions from 'globalActions'


/* ------------------------------------ */


// - Create Master component class
export class Master extends Component {

static isPrivate = true
// Constructor
constructor(props){
  super(props);
  this.state = {
    loading: true,
    authed:false,
    dataLoaded:false
  };

  // Binding functions to `this`
  this.handleLoading = this.handleLoading.bind(this)
  this.handleMessage = this.handleMessage.bind(this)


}

// Handle click on message
handleMessage = (evt) => {
  this.props.closeMessage()
}

// Handle loading
handleLoading = (status) => {
  this.setState({
    loading: status,
    authed:false
  })
}


componentWillMount = () => {

var {dispatch} = this.props

  this.removeListener = firebaseAuth().onAuthStateChanged((user) => {

        if (user) {
        this.props.login(user)
          this.setState({
            loading: false
          })
          if (!this.props.global.defaultLoadDataStatus) {
              this.props.clearData()
              this.props.loadData()
              this.props.defaultDataEnable()
          }
        } else {
         this.props.logout()
          this.setState({
            loading: false
          })
          if(this.props.global.defaultLoadDataStatus){
            this.props.defaultDataDisable()
            this.props.clearData()
          }
            this.props.loadDataGuest()
        }
      })

}
componentWillUnmount = () => {

}
// Render app DOM component

  render() {

    return (
      <div id="master">
        <div className='master__progress' style={{
            display: (this.props.global.visible ? 'block' : 'none' )}}>
 <Progress percent={this.props.global.percent} color='teal' size='tiny' active />

 </div>
 <div className='master__message' style={{
     display: (this.props.global.messageHidden ? 'none' : 'block')}}>
   <Message size='mini' color={this.props.global.messageColor || 'teal'} onClick={this.handleMessage} className="master__message" compact>{this.props.global.message}</Message>
 </div>
    <MasterLoading activeLoading={this.state.loading} handleLoading={this.handleLoading}/>
     <BlogHeader/>

      <Switch>
        <Route path="/signup" component={Signup}/>
        <Route path="/login" component={Login}/>
        <PrivateRoute path="/admin" component={Admin}/>
        <Route path="/" component={Home}/>

      </Switch>
      </div>
    )
  }
}

// - Map dispatch to props
const mapDispatchToProps = (dispatch,ownProps) => {
  console.log('start');
  return{
    loadData: () => {
      dispatch(commentActions.dbGetComments())
      dispatch(imageGalleryActions.downloadForImageGallery())
      dispatch(postActions.dbGetPosts())
      dispatch(userActions.dbGetUserInfo())

    },
    clearData: () => {
      dispatch(imageGalleryActions.clearAllData())
      dispatch(postActions.clearAllData())
      dispatch(userActions.clearAllData())
      dispatch(commentActions.clearAllData())
    },
    login: (user) => {
        dispatch(authorizeActions.login(user.uid))
    },
    logout: () => {
        dispatch(authorizeActions.logout())
    },
    defaultDataDisable: () => {
      dispatch(globalActions.defaultDataDisable())
    },
    defaultDataEnable: () => {
      dispatch(globalActions.defaultDataEnable())
    },
    closeMessage: () => {
      dispatch(globalActions.hideMessage())
    },
    loadDataGuest: () => {
      dispatch(globalActions.loadDataGuest())
    }

  }
    console.log('end');
}

// - Map state to props
const mapStateToProps = (state)=>{
  return{
    uid: state.authorize.uid,
    authed: state.authorize.authed,
    global: state.global
  }

}
// - Connect commponent to redux store
export default withRouter(connect(mapStateToProps,mapDispatchToProps)(Master))
