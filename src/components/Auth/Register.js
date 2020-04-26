import React from 'react'
import {Grid,Form,Segment,Button,Header,Message,Icon} from 'semantic-ui-react'
import {Link} from 'react-router-dom'
import firebase from '../../firebase'
import md5 from 'md5'

class Register extends React.Component {

    state ={
        username: "",
        email: "",
        password: "",
        passwordConfirm: "",
        errors: [],
        loading: false,
        usersRef: firebase.database().ref('users')
    }
    

    isFormEmpty = ({username,email,password,passwordConfirm}) => {
        return !username.length || !email.length || !password.length || !passwordConfirm.length
    }

    isPasswordValid = ({password,passwordConfirm}) => {
        return ((password.length < 6 || passwordConfirm.length < 6) ||
         (password.toLowerCase() !== passwordConfirm.toLowerCase()) ? false : true) 
    }

    isFormValid =()=>{
        let errors = []
        let error
        if(this.isFormEmpty(this.state)){
            error = {message : "fill in all fields"}
            this.setState({errors: errors.concat(error)})
            return false
        }
        else if(!this.isPasswordValid(this.state)){
            error = {message: "passwords must be at least 6 characters and to match"}
            this.setState({errors: errors.concat(error)})
            return false
        }
        return true
    }

    displayErrors = errors => 
        errors.map((error,i)=> (<p key={i}>{error.message}</p>))
    

    highlightMarkupErrors = (errors,inputName) => {
        return errors.some(error=> error.message.toLowerCase().includes(inputName)) ||
                errors.some(error=>error.message.toLowerCase().includes("fields")) ? 'error' : ''
    }

    handleChange = (e)=> {
        this.setState({[e.target.name]:e.target.value})
    }

    saveUser = createdUser => {
        const {uid,displayName,photoURL} = createdUser.user
        return this.state.usersRef.child(uid).set({
            name: displayName,
            avatar: photoURL
        })
    }
    handleSubmit= (e)=> {
        const {email,password,username,errors} = this.state
        e.preventDefault()
        if(this.isFormValid()){
            this.setState({errors: [], loading: true})
             firebase
                .auth()
                .createUserWithEmailAndPassword(email,password)
                .then(createdUser => {
                    createdUser.user.updateProfile({
                        displayName: username,
                        photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
                    })
                    .then(()=> {
                        this.saveUser(createdUser).then(()=>{
                            console.log("user saved");
                        })
                    })
                    .catch (err=> {
                        this.setState({errors: errors.concat(err), loading: false})
                    })
                })
                .catch(err => {
                    this.setState({errors: errors.concat(err), loading: false})
                })
        }
        
    }
    render(){
        const {
            username,
            email,
            password,
            passwordConfirm,
            errors,
            loading
          } = this.state;
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as="h1" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece" color="orange"/>
                        Register
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input fluid name="username" icon="user" iconPosition="left" placeholder="Username"
                                onChange={this.handleChange} type="text" value={username}
                                className={this.highlightMarkupErrors(errors,'username')}/>
                            <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email Address"
                                onChange={this.handleChange} type="email" value={email}
                                className={this.highlightMarkupErrors(errors,'email')}/>
                            <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password"
                                onChange={this.handleChange} type="password" value={password}
                                className={this.highlightMarkupErrors(errors,'password')}/>
                            <Form.Input fluid name="passwordConfirm" icon="repeat" iconPosition="left" placeholder="Confirm Password"
                                onChange={this.handleChange} type="password" value={passwordConfirm}
                                className={this.highlightMarkupErrors(errors,'password')}/>
                            <Button disabled={loading} className={loading ? 'loading' : ''} color='orange' fluid size='large'>Submit</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>Already a user?<Link to='/login'>Login</Link></Message>
                </Grid.Column>
            </Grid>
        )
    
    }
    }

export default Register
