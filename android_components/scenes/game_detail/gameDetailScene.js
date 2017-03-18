import React, { Component } from 'react';
import { LoadingButton } from '../../buttons/loadingButton.js';
import { Application } from '../../../shared_components/application.js';
import { GameListScene } from '../game_list/gameListScene.js';

import {
  Text, StyleSheet, TextInput, View, ScrollView, ToastAndroid
} from 'react-native';

export class GameDetailScene extends Component {
  constructor(props) {
    super(props);
    this.addNewGame = this._addNewGame.bind(this);
  }

  componentWillMount() {
    this.setState({
      gameDetail : this.props.game != undefined,
      loading : false,
      gameName : '',
      gameDescription : '',
      maxPlayers : -1
    });
    setTimeout(() => {}, 300);
  }

  render() {
    const { game } = this.props,
          { gameDetail, loading } = this.state;
    let partial = [];
    if(gameDetail) {
      partial.push(
        <Text style={[styles.textRow]}>
          <Text style={styles.bold}>Name : </Text>{game.Name}
        </Text>
      );
      partial.push(
        <Text style={[styles.textRow, styles.gameDescription]}>
          <Text style={styles.bold}>Brief description of the game : </Text>
          {game.Description}
        </Text>
      );
      partial.push(
        <Text style={[styles.textRow]}>
          <Text style={styles.bold}>Players per match : {game.MaxPlayers}</Text>
        </Text>
      );
    } else { //new game
      partial.push(
        <View style={styles.inputRow}>
          <Text style={styles.bold}>
            Name :
          </Text>
          <TextInput style={styles.input}
                     placeholder='Game Name'
                     maxLength={50}
                     onChangeText={(gameName) => this.setState({gameName})}
                     onSubmitEditing={() => this.refs.description.focus()}
                     returnKeyType='next'
                     />
        </View>
      );
      partial.push(
        <View style={[styles.inputRow, {flex:1, flexDirection:'column', alignItems:'stretch', maxHeight:150}]}>
          <Text style={styles.bold}>
            Description :
          </Text>
          <TextInput ref='description'
                     style={styles.description}
                     placeholder='Game Description'
                     maxLength={300}
                     onChangeText={(gameDescription) => {this.setState({gameDescription})}}
                     multiline={true}
                     onSubmitEditing={() => this.refs.maxPlayers.focus()}
                     />
        </View>
      );
      partial.push(
        <View style={styles.inputRow}>
          <Text style={styles.bold}>
            Players :
          </Text>
          <TextInput ref='maxPlayers'
                     style={styles.input}
                     placeholder='Number of players per match'
                     onChangeText={(maxPlayers) => {this.setState({maxPlayers})}}
                     keyboardType='numeric'
                     returnKeyType='done'
                     />
        </View>
      );
    }
    return (
      <View style={{flex:1}}>
        <ScrollView style={styles.container}>
          {partial}
        </ScrollView>
        <LoadingButton style={styles.button}
                       loading={loading}
                       onPress={this.addNewGame}
                       underlayColor='gray'
                       text='Submit'/>
      </View>
    );
  }

  _addNewGame() {
    const {gameName, gameDescription, maxPlayers } = this.state;
    if(gameName != '' && gameDescription != '' && maxPlayers != -1) {
      this.setState({loading : true});
      const request = {
        method : 'POST',
        headers : {
          'Accept' : 'application/json',
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify({
          Type : 'GameOwnerAddGame',
          SessionToken : Application.SessionToken,
          API_Token : Application.APIToken,
          GameName : gameName,
          gameDescription : gameDescription,
          MaxPlayers : parseInt(maxPlayers)
        })
      };
      fetch('http://gamemate.di.unito.it:8080/owner/game/add', request)
        .then((response) => response.json())
        .then((responseJson) => {
          switch (responseJson.Type) {
            case 'GameOwnerAddGame':
              ToastAndroid.show('Game added successfully', ToastAndroid.SHORT);
              this.props.navigator.replacePreviousAndPop({
                name : 'Your uploaded Games',
                component : GameListScene,
                /*passProps : {
                  newGame : {
                    ID : responseJson.ID,
                    Name : this.state.gameName,
                    Description : this.state.gameDescription,
                    MaxPlayers : this.state.maxPlayers
                  }
                }*/
              });
              break;
            case 'ErrorDetail':
              ToastAndroid.show('Error during the request : ' + responseJson.ErrorMessage, ToastAndroid.SHORT);
              break;
            default:
              ToastAndroid.show('Error during the request, retry later', ToastAndroid.SHORT);
              console.warn(JSON.stringify(responseJson));
              break;
          }
          this.setState({loading : false});
        });
    } else {
      ToastAndroid.show('Please fill all the fields', ToastAndroid.SHORT);
    }
  }
}

const styles = StyleSheet.create({
  container : {
    flex:1,
    flexDirection:'column',
    marginTop:60,
    margin:5
  },
  textRow : {
    flexDirection:'row',
    height:80,
    margin:20,
    marginBottom:10,
    alignItems:'center'
  },
  inputRow : {
    flexDirection : 'row',
    margin:20,
    marginBottom:10,
    alignItems:'center',
    justifyContent:'center'
  },
  input : {
    flex:1,
    height:50
  },
  description : {
    height:100
  },
  bold : {
    fontWeight : 'bold'
  },
  button : {
    alignItems:'center',
    justifyContent:'center',
    height:100,
    borderRadius:0,
    backgroundColor : 'lightgray'
  }
});
