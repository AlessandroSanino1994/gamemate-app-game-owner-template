import React, { Component } from 'react';
import { ToastAndroid, TouchableOpacity, Text, Alert, Navigator, BackAndroid, StyleSheet } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

export const NavbarMapper = {
  LeftButton(route, navigator, index, navState) {
    return null;
  },
  RightButton(route, navigator, index, navState) {
     return null;
  },
  Title(route, navigator, index, navState) {
    return (<Text style={styles.navbarText}>{route.name}</Text>);
  }
};

const styles = StyleSheet.create({
  navbarText : {
    margin:0,
    fontWeight: "bold",
    fontSize:20,
    color:"#806c00"
  }
})
