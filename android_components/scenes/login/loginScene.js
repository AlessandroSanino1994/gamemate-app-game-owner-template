import React, { Component } from 'react';
import { LoginButton } from './loginButton.js';
import { RegisterButton } from './registerButton.js';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Navigator,
  BackAndroid,
  ToastAndroid,
  Alert
} from 'react-native';

export class LoginScene extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.mainTitle}>Welcome to Gamemate, Developer.</Text>
        <Text style={styles.loginMessage}>Please log in to continue</Text>
        <LoginForm navigator={this.props.navigator}/>
      </View>
    )
  }
}

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username : '',
      password : ''
    };
  }

  render() {
    const { username, password } = this.state;
    const { navigator } = this.props;
    return (
      <View>
        <TextInput
          placeholder='Email'
          onChangeText={(username) => this.setState({username})}
          style={styles.textInput}
          returnKeyType="next"
          maxLength={30}
          onSubmitEditing={() => {this.refs.password.focus()}}/>
        <TextInput
          ref='password'
          onChangeText={(password) => this.setState({password})}
          placeholder='Password'
          secureTextEntry={true}
          maxLength={30}
          style={styles.textInput}
          returnKeyType="done"/>
        <LoginButton navigator={navigator} username={username} password={password}/>
        <RegisterButton navigator={navigator}  username={username} password={password}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
    flexDirection:"column",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  mainTitle : {
    fontSize : 20,
    color : 'black',
    margin:10
  },
  loginMessage : {
    color : 'gray',
    margin:10
  },
  textInput : {
    flex:1,
    maxHeight:70,
    width:300
  }
});
