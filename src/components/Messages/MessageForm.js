import React from 'react'
import {Segment,Button,Input} from 'semantic-ui-react'
import firebase from '../../firebase'
import FileModal from './FileModal'
import uuidv4 from 'uuid/v4'
import ProgressBar from './ProgressBar'



class MessageForm extends React.Component {
    
    
    state={
        message: '',
        loading: false,
        errors: [],
        user: this.props.currentUser,
        channel: this.props.currentChannel,
        modal: false,
        uploadState: '',
        uploadTask : null,
        storageRef: firebase.storage().ref(),
        percentUploaded: 0
    }


    handleChange = e => {
        this.setState({[e.target.name]:e.target.value})
    }

    createMessage = (fileURL = null) => {
        const {user} = this.state
        const newMessage = {
            user: {
                id: user.uid,
                name: user.displayName,
                avatar: user.photoURL
            },
            timestamp: firebase.database.ServerValue.TIMESTAMP,

        }
        if(fileURL !== null){
            newMessage['image'] = fileURL
        }
        else{
            newMessage['content'] = this.state.message
        }
        return newMessage
    }

    sendMessage = () => {
        const { getMessagesRef } = this.props;
        const { message, channel,errors } = this.state;
        if(message) {
            this.setState({loading: true})
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(()=>{
                    this.setState({loading:false, message:'', errors:[]})
                })
                .catch(err=>{
                    console.error(err);
                    this.setState({loading:false,errors: errors.concat(err)})
                })
        }
        else{
            this.setState({errors: errors.concat({message: "Add a message"})})
        }
    }

    getPath = () => {
        if(this.props.isPrivateChannel){
            return `chat/private-${this.state.channel.id}`
        }
        return 'chat/public'
    }

    uploadFile = (file,metadata) => {
        const pathToUpload = this.state.channel.id
        const ref = this.props.getMessagesRef()
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`

        this.setState({
            uploadState: 'uploading', 
            uploadTask: this.state.storageRef.child(filePath).put(file,metadata)},
            ()=> {
                this.state.uploadTask.on('state_changed',snap=> {
                    const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
                    this.setState({percentUploaded})
                },err => {
                    console.error(err)
                    this.setState({errors: this.state.errors.concat(err), uploadState: "error", uploadTask:null})
                },()=>{
                    this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl=>{
                        this.sendFileMessage(downloadUrl,ref,pathToUpload)
                    })
                    .catch(err=>{
                        console.error(err)
                        this.setState({errors: this.state.errors.concat(err), uploadState: "error", uploadTask:null})
                    })
                }
              )
            })
    }

    sendFileMessage = (fileURL,ref,pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileURL))
            .then(()=>{
                this.setState({uploadState:'done'})
            })
            .catch(err=>{
                console.error(err)
                this.setState({errors: this.state.errors.concat(err)})
            })
    }

    render(){
        const { errors, message, loading,modal,uploadState,percentUploaded } = this.state;
        return (
            <Segment className="message__form">
                <Input fluid 
                    name='message' 
                    value={message}
                    style={{marginBottom:'0.7em'}}
                    label={<Button icon={"add"}/>}
                    labelPosition="left"
                    placeholder="Write Your Message..."
                    className={errors.some(err => err.message.includes('message')) ? 'error' : ''}
                    onChange={this.handleChange}/>
                <Button.Group icon widths="2">
                    <Button color='orange' 
                        content='Add Reply' 
                        labelPosition="left" 
                        icon="edit"
                        disabled={loading}
                        onClick={this.sendMessage}/>
                    <Button color='teal' 
                            disabled={uploadState ==='uploading'}
                            onClick={()=>this.setState({modal:true})} 
                            content='Upload Media' 
                            labelPosition="right" 
                            icon="cloud upload"/>
                </Button.Group>
                    <FileModal modal={modal} 
                               closeModal={()=>this.setState({modal:false})}
                               uploadFile={this.uploadFile}/>
                    <ProgressBar uploadState={uploadState} percentUploaded={percentUploaded}/>
            </Segment>
        )
    }
    
}



export default MessageForm
