import React from 'react'
import {Segment,Comment} from 'semantic-ui-react'
import MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import Message from './Message'
import firebase from '../../firebase'


class Messages extends React.Component {

    state={
        messagesRef: firebase.database().ref('messages'),
        privateMessagesRef: firebase.database().ref('privateMessages'),
        user: this.props.currentUser,
        channel: this.props.currentChannel,
        privateChannel: this.props.isPrivateChannel,
        messages: [],
        messagesLoading: true,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading : false,
        searchResults:[]
    }


    componentDidMount() {
        const { channel, user } = this.state
    
        if (channel && user) {
          this.addListeners(channel.id)
        }
      }
    
      addListeners = channelId => {
        this.addMessageListener(channelId)
      }
    
      addMessageListener = channelId => {
        let loadedMessages = [];
        const ref = this.getMessagesRef()
        ref.child(channelId).on("child_added", snap => {
          loadedMessages.push(snap.val());
          this.setState({
            messages: loadedMessages,
            messagesLoading: false
          })
          this.countUniqueUsers(loadedMessages)
        })
      }

    getMessagesRef = () => {
      const { messagesRef,privateMessagesRef,privateChannel } = this.state
      return privateChannel ? privateMessagesRef : messagesRef
    }

    handleSearchChange = e => {
      this.setState({searchTerm: e.target.value,searchLoading:true},()=>{
        this.handleSearchMessages()
      })
    }

    handleSearchMessages = () => {
      const channelMessages = [...this.state.messages]
      const regex = new RegExp(this.state.searchTerm,'gi')
      const searchResults = channelMessages.reduce((acc,message)=>{
        if((message.content && message.content.match(regex)) || message.user.name.match(regex) ) 
          acc.push(message)
        return acc
      },[]) 
      this.setState({searchResults})
      setTimeout(()=>this.setState({searchLoading:false}),500) 
    }

    countUniqueUsers = messages => {
      const uniqueUsers = messages.reduce((acc,message)=>{
        if(!acc.includes(message.user.name)){
          acc.push(message.user.name)
        }
        return acc
      },[])
      const sumOfUniqueUsers = uniqueUsers.length
      const numUniqueUsers = (sumOfUniqueUsers > 1 || sumOfUniqueUsers===0) ? `${sumOfUniqueUsers} users` : `${sumOfUniqueUsers} user` 
      this.setState({numUniqueUsers})
    }


    displayMessages = messages => (
        messages.length > 0 && messages.map(msg=> (
            <Message key={msg.timestamp} message={msg} user={this.state.user}/>
        ))
    )

    displayChannelName = channel => {
      return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : ''
    }

    render(){
        const {messages,
              messagesRef,
              channel,
              user,
              numUniqueUsers,
              searchTerm,
              searchResults,
              searchLoading,
              privateChannel} = this.state
        return (
            <React.Fragment>
                <MessagesHeader 
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}/>
                <Segment>
                    <Comment.Group className="messages">
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                <MessageForm messagesRef={messagesRef}
                             currentChannel={channel} 
                             currentUser={user}
                             isPrivateChannel={privateChannel}
                             getMessagesRef={this.getMessagesRef}/>
            </React.Fragment>
        )
    }
    
}


export default Messages
