/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import AppNavigator from 'containers/navigation/appNavigator';
import {NativeBaseProvider} from 'native-base';
import React from 'react';
import {StatusBar} from 'react-native';
import {MenuProvider} from 'react-native-popup-menu';
import {Provider} from 'react-redux';
import {Colors} from 'values/colors';
import store from './src/store';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        StatusBar.setBackgroundColor(Colors.COLOR_PRIMARY, true);
        return (
            <NativeBaseProvider>
                <Provider store={store}>
                    <MenuProvider>
                        <AppNavigator />
                    </MenuProvider>
                </Provider>
            </NativeBaseProvider>
        );
    }
}
