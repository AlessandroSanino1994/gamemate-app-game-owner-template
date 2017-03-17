import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { LoadingSpinner } from '../misc/loadingSpinner.js';
import { ToggleButton } from '../buttons/toggleButton.js';

export class LoadingButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { style, loading, onPress, underlayColor, text} = this.props;
    styleReal = style != undefined ? style : styles.default;
    if (loading){
      return (
        <LoadingSpinner style={styleReal} animating={true} />
      );
    } else {
      return ( //undefined handled by togglebutton automatically
        <ToggleButton style={styleReal}
                      onPress={onPress}
                      underlayColor={underlayColor}
                      text={text} />
      );
    }
  }
}

const styles = StyleSheet.create({
  default : {
    flex : 1,
    backgroundColor:"lightgray"
  }
});
