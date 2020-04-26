import React from 'react'
import {Grid,Form,Segment,Button,Header,Message,Icon} from 'semantic-ui-react'
import {Link} from 'react-router-dom'
import firebase from '../../firebase'


class Login extends React.Component {
    state={
        email: "",
        password: "",
        errors: [],
        loading: false
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

    isFormValid = ({email,password}) => email && password
    


    handleSubmit= (e)=> {
        const {email,password,errors} = this.state
        e.preventDefault()
        if(this.isFormValid(this.state)){
            this.setState({errors: [], loading: true})
            firebase
                .auth()
                .signInWithEmailAndPassword(email,password)
                .then(signedInUser=> {
                    console.log(signedInUser)
                })
                .catch(err=>{
                    console.error(err)
                    this.setState({errors: errors.concat(err), loading:false})
                })    
        }
             
    }

    render(){
        const {email,password,errors,loading} = this.state
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as="h1" icon color="violet" textAlign="center">
                        <Icon name="code branch" color="violet"/>
                        Login
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email Address"
                                onChange={this.handleChange} type="email" value={email}
                                className={this.highlightMarkupErrors(errors,'email')}/>
                            <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password"
                                onChange={this.handleChange} type="password" value={password}
                                className={this.highlightMarkupErrors(errors,'password')}/>
                            <Button disabled={loading} className={loading ? 'loading' : ''} color='violet' fluid size='large'>Login</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>Don't have an account? <Link to='/register'>Register</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
    
    
}

export default Login
