import React, {Fragment} from 'react'
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react'
import firebase from '../../firebase'
import {connect} from 'react-redux'
import {setCurrentChannel} from '../../actions/index'

class Channels extends React.Component {

    state={
        channels : [],
        modal : false,
        channelName: "",
        user: this.props.currentUser,
        channelDetails: "",
        channelsRef: firebase.database().ref('channels'),
        firstLoad: true,
        activeChannel: ''
    }
    
    componentDidMount(){
        let loadedChannels = []
        this.state.channelsRef.on('child_added', snap=> {
            loadedChannels.push(snap.val())
            this.setState({channels: loadedChannels},()=>this.setFirstChannel())
        })
    }

    componentWillUnmount(){
        this.state.channelsRef.off()
    }

    setFirstChannel = () => {
        const {channels,firstLoad} = this.state
        const firstChannel = channels[0]
        if(firstLoad && channels.length > 0){
            this.props.setCurrentChannel(firstChannel)
            this.setActiveChannel(firstChannel)
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
                           # {ch.name}
                       </Menu.Item>
        ))
    )

    changeChannel = channel => {
        this.setActiveChannel(channel)
        this.props.setCurrentChannel(channel)
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
           <Menu.Menu style={{paddingBottom: '2em'}}>
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


export default connect(null,{setCurrentChannel})(Channels)
