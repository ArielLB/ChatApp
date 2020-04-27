import React, {Fragment} from 'react'
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react'
import firebase from '../../firebase'
import {connect} from 'react-redux'
import {setCurrentChannel,setPrivateChannel} from '../../actions/index'

class Channels extends React.Component {

    state={
        channels : [],
        channel: null,
        modal : false,
        channelName: "",
        user: this.props.currentUser,
        channelDetails: "",
        channelsRef: firebase.database().ref('channels'),
        messagesRef: firebase.database().ref('messages'),
        notifications: [],
        firstLoad: true,
        activeChannel: ''
    }
    
    componentDidMount(){
        let loadedChannels = []
        this.state.channelsRef.on('child_added', snap=> {
            loadedChannels.push(snap.val())
            this.setState({channels: loadedChannels},()=>this.setFirstChannel())
            this.addNotificationListener(snap.key)
        })
    }

    componentWillUnmount(){
        this.state.channelsRef.off()
    }

    addNotificationListener = channelId => {
        const {messagesRef,channel,notifications} = this.state
        messagesRef.child(channelId).on('value',snap=>{
            if(channel){
                this.handleNotifications(channelId,channel.id,notifications,snap)
            }
        })
    }

    handleNotifications = (channelId,currentChannelId,notifications,snap) => {
        let lastTotal = 0;
        let index = notifications.findIndex(notification => notification.id === channelId)
        if(index !== -1){
            if(channelId !== currentChannelId){
                lastTotal = notifications[index].total
                if(snap.numChildren() - lastTotal > 0){
                    notifications[index].count = snap.numChildren() - lastTotal
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren()
        }
        else{
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            })
        }
        this.setState({notifications})
    }

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(notification=> notification.id === this.state.channel.id)
        if(index !== -1){
            let updatedNotifications = [...this.state.notifications]
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal
            updatedNotifications[index].count = 0
            this.setState({notification: updatedNotifications})
        }
    }

    getNotificationCount = channel => {
        let count = 0
        this.state.notifications.forEach(notification=> {
            if(notification.id === channel.id){
                count = notification.count
            }
        })
        if(count > 0) return count
    }

    setFirstChannel = () => {
        const {channels,firstLoad} = this.state
        const firstChannel = channels[0]
        if(firstLoad && channels.length > 0){
            this.props.setCurrentChannel(firstChannel)
            this.setActiveChannel(firstChannel)
            this.setState({channel: firstChannel})
        }
        this.setState({firstLoad: false})
    }

    displayChannels = channels => (
        channels.length > 0 && channels.map(ch=> (
            <Menu.Item key={ch.id}
                       onClick={()=>this.changeChannel(ch)} 
                       name={ch.name} 
                       style={{opacity: 0.7}}
                       active={ch.id === this.state.activeChannel}>
                           {this.getNotificationCount(ch) && (
                               <Label color='red'>{this.getNotificationCount(ch)}</Label>
                           )}
                           # {ch.name}
            </Menu.Item>
        ))
    )

    changeChannel = channel => {
        this.setActiveChannel(channel)
        this.clearNotifications()
        this.props.setCurrentChannel(channel)
        this.props.setPrivateChannel(false)
        this.setState({channel})
    }

   

    setActiveChannel = channel => {
        this.setState({activeChannel : channel.id})
    }

    handleChange = e => {
        this.setState({[e.target.name]:e.target.value})
    }

    addChannel = () => {
        const {channelsRef,channelName,channelDetails,user} = this.state
        const key = channelsRef.push().key
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        }
        channelsRef
            .child(key)
            .update(newChannel)
            .then(()=>{
                this.setState({channelDetails: "", channelName: "", modal: false})
            })
            .catch(err=> {
                console.error(err);
            })
    }

    handleSubmit = e => {
        e.preventDefault()
        if(this.isFormValid(this.state)){
            this.addChannel()
        }
    }

    isFormValid = ({channelName,channelDetails}) => channelName && channelDetails

    
    render(){
        const {channels,modal,channelName,channelDetails} = this.state
        return (
            <Fragment>
           <Menu.Menu className='menu'>
               <Menu.Item>
                   <span>
                       <Icon name='exchange'/> Channels
                   </span>{" "}
                   ({channels.length}) <Icon name="add" onClick={()=>this.setState({modal:true})}/>
               </Menu.Item>
               {this.displayChannels(channels)}
           </Menu.Menu>
           <Modal basic open={modal} onClose={()=>this.setState({modal:false})}>
               <Modal.Header>Add a Channel</Modal.Header>
               <Modal.Content>
                   <Form onSubmit={this.handleSubmit}>
                       <Form.Field>
                           <Input fluid label='Name of Channel' name='channelName' value={channelName} onChange={this.handleChange}/>
                       </Form.Field>
                       <Form.Field>
                           <Input fluid label='Channel Details' name='channelDetails' value={channelDetails} onChange={this.handleChange}/>
                       </Form.Field>
                   </Form>
               </Modal.Content>
               <Modal.Actions>
                   <Button color="green" inverted onClick={this.handleSubmit}> 
                        <Icon name="checkmark"/> Add
                   </Button>
                   <Button color="red" inverted onClick={()=>this.setState({modal:false})}> 
                        <Icon name="remove"/> Cancel
                   </Button>
               </Modal.Actions>
           </Modal>
           </Fragment>
        )
    }
    
}


export default connect(null,{setCurrentChannel,setPrivateChannel})(Channels)
