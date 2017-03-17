import React, { Component } from 'react';
import { Application } from '../../../shared_components/application.js';
import { LoadingButton } from '../../buttons/loadingButton.js';
import { ToggleButton } from '../../buttons/toggleButton.js';
import { LoadingSpinner } from '../../misc/loadingSpinner.js';
import { GameDetailScene } from '../game_detail/gameDetailScene.js';

import {
  Text,
  StyleSheet,
  ListView,
  View,
  ActivityIndicator,
  ToastAndroid,
  Alert
} from 'react-native';

const errorRow = [{
  ID : -1,
  Name: 'An error occurred, please retry.',
  Description : '',
  MaxPlayers : -1
}];

const emptyGamesRow = [{
  ID : -1,
  Name: 'Hello. It looks like you haven\'t added a game yet, wanna add one now? Click the button below.',
  Description : '',
  MaxPlayers : -1
}];

const dataSourceModel = new ListView.DataSource({rowHasChanged : (r1, r2) => r1 !== r2});

export class GameListScene extends Component {
  constructor(props) {
    super(props);
    this.renderRow = this._renderRow.bind(this);
    this.showNewGameScene = this._showNewGameScene.bind(this);
    this.removeHandler = this._removeHandler.bind(this);
  }

  componentWillMount() {
    this.setState({
      loading : true,
      datasource : dataSourceModel.cloneWithRows([]),
      rows : [],
      isDummy : false
    });
  }

  componentDidMount() {
      setTimeout(() => {
        this.getGames();
      }, 300); //waiting for UI to show before requesting, navigator animation end.
      //TODO : find another way, like triggering navigator.
  }


  _removeHandler(game) {
    const { rows } = this.state.rows;
    //rows.splice(rows.indexOf(token), 1);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].Name == game.Name) {
        rows.splice(i, 1);
        break;
      }
    }
    this.setState({
      rows : rows,
      datasource : dataSourceModel.cloneWithRows(rows)
    });
  }

  getGames() {
    this.setState({loading : true});
    const request = {
      method : 'POST',
      headers : {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify({
        Type : 'GameOwnerGameList',
        API_Token : Application.APIToken,
        SessionToken : Application.SessionToken
      })
    };
    fetch('http://gamemate.di.unito.it:8080/owner/game/list', request)
        .then((response) => response.json())
        .then((responseJson) => {
          console.warn(JSON.stringify(responseJson));
          switch (responseJson.Type) {
            case 'GameOwnerGameList':
              const emptyList = responseJson.Games.length == 0,
                    rows = emptyList ? emptyGamesRow : responseJson.Games;
              this.setState({
                isDummy : emptyList,
                rows : rows,
                datasource : dataSourceModel.cloneWithRows(rows)
              });
              break;
            case 'ErrorDetail':
              ToastAndroid.show('There was a problem : ' + responseJson.ErrorMessage, ToastAndroid.LONG);
              this.setState({
                isDummy : true,
                rows : errorRow,
                datasource : dataSourceModel.cloneWithRows(errorRow)
              });
              break;
            default:
              ToastAndroid.show('There was a problem while getting your list of games', ToastAndroid.LONG);
              this.setState({
                isDummy : true,
                rows : errorRow,
                datasource : dataSourceModel.cloneWithRows(errorRow)
              });
              console.warn(JSON.stringify(responseJson));
          }
          this.setState({loading : false});
        }).catch((error) => {
          ToastAndroid.show('Problems during the download of the game list', ToastAndroid.LONG);
          this.setState({
            isDummy : true,
            rows : errorRow,
            datasource : dataSourceModel.cloneWithRows(errorRow),
            loading : false
          });
          console.warn(JSON.stringify(error));
          //alert(JSON.stringify(error));
        });
  }

  _showNewGameScene() {
    this.props.navigator.push({
      name : "New Game",
      component : GameDetailScene
    });
  }

  render() {
    const { loading, adding, datasource } = this.state;
    let partial = [];
    if(loading) {
      partial.push(
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator style={styles.loader} animating={true} size='large'/>
          <Text style={styles.loaderText}>Loading game list...</Text>
        </View>
      );
    } else {
      partial.push(
        <ListView style={styles.list}
                  dataSource={datasource}
                  renderRow={this.renderRow}
          />
      );
    }
    partial.push(
      <LoadingButton style={[styles.buttonNormal, {height:100, borderRadius:0}]}
                     loading={adding}
                     underlayColor='gray'
                     onPress={this.showNewGameScene}
                     text='Add a new game'/>
    );
    return (
      <View style={styles.container}>
        {partial}
      </View>
    );
  }

  _renderRow(singleGame) {
    return (
      <TokenRow game={singleGame}
                isDummy={this.state.isDummy}
                removeHandler={this.removeHandler}
                navigator={this.props.navigator}/>
    );
  }
}

class TokenRow extends Component {
  constructor(props) {
    super(props);
    this.onRemoving = this._onRemoving.bind(this);
    this.showDetail = this._showDetail.bind(this);
  }

  componentWillMount() {
    this.setState({
      removing : false
    });
  }

  _onRemoving() {
    Alert.alert(
      'You are removing the game : ' + this.props.game.Name,
      'Are you sure?',
      [
        {text : "Yes, DELETE PERMANENTLY", onPress : this.removeGame},
        {text : "No, go back"}
      ]
    );
  }

  _removeGame() {
      //TODO : FIX
      this.setState({removing : true});
      const request = {
        method : 'POST',
        headers : {
          'Accept' : 'application/json',
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify({
          Type : 'GameOwnerRemoveGame',
          API_Token : Application.APIToken,
          SessionToken : Application.SessionToken,
          GameID : this.props.game.ID
        })
      };
      //alert(JSON.stringify(JSON.parse(request.body)))
      fetch('http://gamemate.di.unito.it:8080/owner/game/remove', request)
      .then((response) => response.json())
      .then((responseJson) => {
        //alert(JSON.stringify(responseJson));
        switch (responseJson.Type) {
          case 'GameOwnerRemoveGame':
            ToastAndroid.show('Game successfully deleted', ToastAndroid.SHORT);
            this.props.removeHandler(this.props.token);
            break;
          case 'ErrorDetail':
            ToastAndroid.show('Error : ' + responseJson.ErrorMessage, ToastAndroid.SHORT);
            break;
          default:
            ToastAndroid.show('Unknown error while deleting, retry later. ', ToastAndroid.SHORT);
            break;
        }
        this.setState({removing : false});
      }).catch((error) => {
        ToastAndroid.show('Unknown error while handling response, retry later '  + JSON.stringify(error), ToastAndroid.SHORT);
        this.setState({removing : false});
        console.warn(JSON.stringify(error));
      });
  }

  _showDetail() {
    this.props.navigator.push({
      name : 'Game Detail',
      component : GameDetailScene,
      passProps : {
        game : this.props.game
      }
    });
  }

  render() {
    const { game, isDummy } = this.props,
          { removing } = this.state,
          visible = isDummy ? 0 : 1;
    let partial = [];
    partial.push(
      <Text style={styles.rowText}>
        {game.ID} : {game.Name}
      </Text>
    );
    if(!isDummy) {
      partial.push(
        <View style={{flex:2, flexDirection:'row', margin:15, marginRight:10}} //TODO: verify
          >
          <ToggleButton
            style={[styles.buttonNormal, {flex:2, opacity : visible, margin:15, margin:10}]} //TODO: verify
            underlayColor='gray'
            onPress={this.showDetail}
            text='Detail' />
          <LoadingButton
            loading={removing}
            style={[styles.buttonNormal, {flex:2, opacity : visible, margin:10}]}
            underlayColor='gray'
            onPress={this.onRemoving}
            text='Remove' />
        </View>
      );
    }

    return (
      <View style={styles.row}>
        {partial}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    flexDirection : 'column',
    backgroundColor:'white'
  },
  list: {
    flex:10,
    flexDirection:'column',
    marginTop : 60, //navbar
    //backgroundColor:'red'
  },
  row: {
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    paddingTop : 10,
    borderBottomWidth : 1,
    //borderBottomColor:'gray',
    padding : 5
  },
  rowText : {
    flex:1,
    //backgroundColor:'yellow'
  },
  buttonNormal : {
    alignItems:'center',
    justifyContent:'center',
    borderRadius:30,
    backgroundColor : 'lightgray'
  },
  loader : {
    flex:2,
    justifyContent : 'flex-end'
  },
  loaderText : {
    flex : 1
  },
  center : {
    alignItems : 'center'
  }
});
