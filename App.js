/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import { AppNavigator } from 'containers/navigation';
import { Root } from 'native-base';
import React from 'react';
import {
  Platform, StatusBar, StyleSheet
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import KeyboardManager from 'react-native-keyboard-manager';
import { MenuProvider } from 'react-native-popup-menu';
import { Provider } from 'react-redux';
import { Colors } from 'values/colors';
import store from './src/store';

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
    }
    global.bundleId = DeviceInfo.getBundleId();
    // global.bundleId = configConstants.APP_ADMIN;
    // global.bundleId = configConstants.APP_USER;
    Platform.OS === 'android' ? null : KeyboardManager.setEnable(true)
  }

  render() {
    Platform.OS === 'android' ? StatusBar.setBackgroundColor(Colors.COLOR_PRIMARY, true) : null;
    return (
      <Provider store={store}>
        <Root>
          <MenuProvider>
            <AppNavigator />
          </MenuProvider>
        </Root>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({

});

