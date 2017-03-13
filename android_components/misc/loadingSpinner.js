import React, {
  Component
} from 'react';
import {
  ActivityIndicator,
  StyleSheet
} from 'react-native';

export class LoadingSpinner extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ActivityIndicator style={this.props.style == undefined ? styles.spinner : this.props.style} animating={this.props.animating} size="large" color="gray"/>
    );
  }
}

const styles = StyleSheet.create({
  spinner : {
    flex : 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginLeft:5,
    marginRight:5
  }
});
