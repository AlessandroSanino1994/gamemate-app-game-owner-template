import React, { Component } from 'react';
import { LoginScene } from './android_components/scenes/login/loginScene.js';
import { ApiListScene } from './android_components/scenes/game_list/gameListScene.js';
import { NavbarMapper } from './android_components/navbar/navbarMapper.js';

import {
  AppRegistry,
  StyleSheet,
  Navigator,
  BackAndroid,
  ToastAndroid
} from 'react-native';

console.disableYellowBox = true;

export default class GamemateAdmin extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    let response = fetch('http://gamemate.di.unito.it:8080/', {
      method : 'POST'
    }).catch((error) => {
      ToastAndroid.show('Please check your network connection', ToastAndroid.SHORT);
    });
  }

  render() {
    return (
      <Navigator style={{flex : 1}}
        ref='nav'
        initialRoute={{name : 'Game Owner Platform by Gamemate', component : LoginScene, index : 0}}
        renderScene={this.renderScene}
        configureScene={this.configureScene}
        navigationBar={
          <Navigator.NavigationBar
          navigationStyles={Navigator.NavigationBar.StylesIOS}
          routeMapper={NavbarMapper}
          style={styles.navbar} />
        } />
    );
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => { this.refs.nav.pop(); return this.refs.nav.getCurrentRoutes().length != 1;});
  }

  renderScene(route, navigator) {
    if(route.name == 'Game Owner Platform by Gamemate')
      return <LoginScene navigator={navigator} />;
    else if (route.name == 'Your uploaded Games')
      return <GameListScene navigator={navigator} />;
    else if (route.gameDetail != undefined) {
      //return <GameDetailScene navigator={navigator} />
    }
  }

  configureScene(route, routeStack) {
   return Navigator.SceneConfigs.PushFromRight; //FloatFromBottom
  }
}

const styles = StyleSheet.create({
    navbar : {
      backgroundColor : '#e1ec2b',
      borderBottomColor : 'brown',
      borderBottomWidth : 1,
      margin : 0
    }
});

AppRegistry.registerComponent('GamemateAdmin', () => GamemateAdmin);
