import React, { Component } from 'react';
import { Application } from '../../../shared_components/application.js';
import { LoadingButton } from '../../buttons/loadingButton.js';
import { LoadingSpinner } from '../../misc/loadingSpinner.js';

import {
  Text,
  StyleSheet,
  ListView,
  View,
  ActivityIndicator,
  ToastAndroid
} from 'react-native';

const dummySources = [
  'An error occurred, please retry.'
];

const dataSourceModel = new ListView.DataSource({rowHasChanged : (r1, r2) => r1 !== r2});

export class ApiListScene extends Component {
  constructor(props) {
    super(props);
    this.renderRow = this._renderRow.bind(this);
    this.onPressedAdd = this._reqNewAPI.bind(this);
    this.RemoveHandler = this._RemoveHandler.bind(this);
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
        this.gatGames();
      }, 300); //waiting for UI to show before requesting, navigator animation end.
      //TODO : find another way, like triggering navigator.
  }


  _RemoveHandler(token) {
    this.state.rows.splice(this.state.rows.indexOf(token), 1);
    const rows = this.state.rows;
    this.setState({
      rows : rows,
      datasource : dataSourceModel.cloneWithRows(rows)
    });
  }

  gatGames() {
    //this.setState({loading : true});
    const request = {
      method : 'POST',
      headers : {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify({
        Type : 'OwnerGameList',
        API_Token : Application.APIToken,
        SessionToken : Application.SessionToken
      })
    };
    fetch('http://gamemate.di.unito.it:8080/owner/game/list', request)
        .then((response) => response.json())
        .then((responseJson) => {
          switch (responseJson.Type) {
            case 'OwnerGameList':
              this.setState({
                rows : responseJson.Tokens,
                datasource : dataSourceModel.cloneWithRows(responseJson.Tokens)
              });
              break;
            case 'ErrorDetail':
              ToastAndroid.show('There was a problem : ' + responseJson.ErrorMessage, ToastAndroid.LONG);
              this.setState({
                isDummy : true,
                rows : dummySources,
                datasource : dataSourceModel.cloneWithRows(dummySources)
              });
              break;
            default:
              ToastAndroid.show('There was a problem while getting your tokens', ToastAndroid.LONG);
              this.setState({
                isDummy : true,
                rows : dummySources,
                datasource : dataSourceModel.cloneWithRows(dummySources)
              });
          }
          this.setState({loading : false});
          //alert(JSON.stringify(responseJson));
        }).catch((error) => {
          ToastAndroid.show('Problems during the download of the tokens', ToastAndroid.LONG);
          this.setState({
            isDummy : true,
            rows : dummySources,
            datasource : dataSourceModel.cloneWithRows(dummySources),
            loading : false
          });
          console.warn(JSON.stringify(error));
          //alert(JSON.stringify(error));
        });
  }

  render() {
    const { loading, adding, datasource } = this.state;
    let partial = [];
    if(loading) {
      partial.push(
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator style={styles.loader} animating={true} size='large'/>
          <Text style={styles.loaderText}>Loading tokens...</Text>
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
                     onPress={this.onPressedAdd}
                     text='Generate new token'/>
    )
    return (
      <View style={styles.container}>
        {partial}
      </View>
    );
  }

  _renderRow(singleItem) {
    return (
      <Text>
        DUMMYYYYYYYYYYY
      </Text>//<TokenRow game={singleItem} isDummy={this.state.isDummy} RemoveHandler={this.RemoveHandler}/>
    );
  }
}

class TokenRow extends Component {
  constructor(props) {
    super(props);
    this.onRemoving = this._onRemoving.bind(this);
  }

  componentWillMount() {
    this.setState({
      removing : false
    });
  }

  _onRemoving() {
    Alert.alert(
      'You are removing the game : ' + this.props.game.name,
      'Are you sure?',
      [
        {text : "Yes, DELETE PERMANENTLY", onPress : _removeGame},
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
          Type : 'DropToken',
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
          case 'DropToken':
            ToastAndroid.show('Game successfully deleted', ToastAndroid.SHORT);
            this.props.RemoveHandler(this.props.token);
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

  render() {
    const visible = this.state.isDummy ? 0 : 1;
    return (
      <View style={styles.row}>
        <Text style={styles.rowText}>
          {this.props.token}
        </Text>
        {!this.state.isDummy &&
        <View style={{flex:1, flexDirection:'row', marginRight:10}}>
        <LoadingSpinner animating={this.state.removing} />
        <ToggleButton
            style={[styles.buttonNormal, {flex:2, opacity : visible, margin:15}]}
            underlayColor='gray'
            onPressed={this.onRemoving}
            text='Drop'/>
        </View>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container : {
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
    paddingTop : 10,
    borderBottomWidth : 1,
    //borderBottomColor:'gray',
    padding : 5
  },
  rowText : {
    flex:2,
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
