
import React, { Component } from 'react';
import { View, TextInput, Image, StyleSheet, Text, ImageBackground, TouchableOpacity, TouchableHighlight, Keyboard, SafeAreaView, BackHandler, Dimensions, NativeModules, NativeEventEmitter, Alert } from 'react-native';
import { Container, Form, Content, Item, Input, Button, Right, Icon, Header, Root, Left, Body, Title, Toast } from 'native-base';
import StringUtil from 'utils/stringUtil';
import styles from './styles';
import { localizes } from 'locales/i18n';
import BaseView from "containers/base/baseView";
import * as actions from 'actions/userActions';
import * as commonActions from 'actions/commonActions';
import { connect } from 'react-redux';
import commonStyles from 'styles/commonStyles';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import { Colors } from 'values/colors';
import { ErrorCode } from 'config/errorCode';
import Utils from 'utils/utils';
import StorageUtil from 'utils/storageUtil';
import { dispatch } from 'rxjs/internal/observable/pairs';
import { StackActions, NavigationActions } from 'react-navigation'
import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager, LoginButton } from 'react-native-fbsdk';
import GenderType from 'enum/genderType';
import statusType from 'enum/statusType';
import screenType from 'enum/screenType';
import firebase from 'react-native-firebase';
import bannerType from 'enum/bannerType';
import TextInputCustom from 'components/textInputCustom';
import { configConstants } from 'values/configConstants';
import DialogCustom from 'components/dialogCustom';
import DateUtil from 'utils/dateUtil';
import Upload from 'react-native-background-upload'
import ImagePicker from "react-native-image-picker";
import moment from 'moment';
// import {RNZaloLogin, RNZBridgeEmitter} from 'react-native-zalo-login';
import Server from 'config/Server';

const options = {
    title: 'Select Image',
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

export default class AddPerson extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            name: null,
            age: null,
            loading: false
        }
        const { group } = this.props.navigation.state.params;
        this.group = group;
        this.firebaseRef = firebase.database();
        this.personGroup = "";
        this.personId = null;
    }

    componentDidMount() {
        // super.componentDidMount();
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton)
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    render() {
        return (
            <Root>
                <View style={[styles.container, { backgroundColor: Colors.COLOR_PURPLE }]}>
                    <TextInput
                        placeholder={"Tên của bạn"}
                        placeholderTextColor={Colors.COLOR_BACKGROUND}
                        returnKeyType={"done"}
                        style={[commonStyles.textBold, {
                            color: Colors.COLOR_WHITE,
                            elevation: 0,
                            paddingHorizontal: Constants.PADDING_X_LARGE,
                            margin: 0,
                            marginHorizontal: Constants.MARGIN_X_LARGE,
                            // height: Constants.HEIGHT_INPUT * 2,
                            width: deviceWidth - Constants.MARGIN_XX_LARGE * 3.5,
                            fontSize: Fonts.FONT_SIZE_XX_LARGE,
                            textAlign: "center",
                            paddingVertical: Constants.PADDING_LARGE,
                        }]}
                        value={this.state.name}
                        onChangeText={
                            name => {
                                this.setState({
                                    name: name,
                                })
                            }
                        }
                        autoCapitalize={"none"}
                        underlineColorAndroid={Colors.COLOR_BACKGROUND}
                    />
                    <TextInput
                        placeholder={"Nhập tuổi nữa"}
                        placeholderTextColor={Colors.COLOR_BACKGROUND}
                        returnKeyType={"done"}
                        style={[commonStyles.textBold, {
                            color: Colors.COLOR_WHITE,
                            elevation: 0,
                            paddingHorizontal: Constants.PADDING_X_LARGE,
                            margin: 0,
                            marginHorizontal: Constants.MARGIN_X_LARGE,
                            // height: Constants.HEIGHT_INPUT * 2,
                            marginTop: Constants.MARGIN_X_LARGE,
                            width: deviceWidth - Constants.MARGIN_XX_LARGE * 3.5,
                            fontSize: Fonts.FONT_SIZE_XX_LARGE,
                            textAlign: "center",
                            paddingVertical: Constants.PADDING_LARGE,
                        }]}
                        value={this.state.age}
                        onChangeText={
                            age => {
                                this.setState({
                                    age: age,
                                })
                            }
                        }
                        autoCapitalize={"none"}
                        keyboardType={"number-pad"}
                        underlineColorAndroid={Colors.COLOR_BACKGROUND}
                    />
                </View>
                {this.state.age != null && this.state.name != null ?
                    <TouchableOpacity
                        onPress={() => {
                            this.addPersonToAPI();
                            this.setState({
                                loading: true
                            })
                        }}
                        style={{
                            position: 'absolute',
                            alignItems: 'center',
                            backgroundColor: Colors.COLOR_WHITE,
                            paddingVertical: Constants.PADDING_LARGE,
                            paddingHorizontal: Constants.PADDING_X_LARGE + 8,
                            borderRadius: Constants.CORNER_RADIUS / 2,
                            bottom: Constants.MARGIN_XX_LARGE + 16, right: Constants.MARGIN_XX_LARGE + 16
                        }}>
                        <Text style={[commonStyles.textBold, { fontSize: Fonts.FONT_SIZE_XX_LARGE }]}> > </Text>
                    </TouchableOpacity> : null}
                {this.showLoadingBar(this.state.loading)}
            </Root>
        );
    }

    createGroup = () => {
        let body = {
            "name": this.state.name,
            "userData": "boot data",
            "recognitionModel": "recognition_02"
        }
        console.log("BODY REQUEST FACE API: ", body)
        fetch(Server.FACE_API + `persongroups/${this.state.name}`, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((response) => {
            console.log("Response after create persongroup: ", response);
            if (response.status == 200) {

                let data = {
                    [`${this.state.name}`]: {
                        "groupName": this.state.name
                    },
                }
                this.firebaseRef.ref().update(data).then(() => {
                    console.log("Data saved successfully.");
                    this.setState({
                        loading: false
                    }, () => {
                        Alert.alert(
                            localizes('notification'),
                            "Tạo person group thành công",
                            [
                                {
                                    text: 'OK', onPress: () => {

                                    }
                                }
                            ],
                            { cancelable: false },
                        );
                    })
                    Keyboard.dismiss();
                }).catch((error) => {
                    this.setState({
                        loading: false
                    }, () => {
                        Alert.alert(
                            "OOPPP",
                            "Có cái gì đó không đúng rồi ",
                            [
                                {
                                    text: 'OK', onPress: () => {
                                    }
                                }
                            ],
                            { cancelable: false },
                        );
                    });
                    console.log("Data could not be saved.", error);
                });


            } else {
                this.setState({
                    loading: false
                }, () => {
                    Alert.alert(
                        "OOPPP",
                        "Có cái gì đó không đúng rồi ",
                        [
                            {
                                text: 'OK', onPress: () => {
                                }
                            }
                        ],
                        { cancelable: false },
                    );
                });
            }
        })
            .catch((error) => {
                console.error(error);
            });
    }

    addMemberToFireBase = (person) => {
        let key = this.state.name.replace(/ /g, "_");
        let data = {
            [`${this.group}/${key}`]: {
                name: this.state.name,
                personId: person.personId,
            },
        }
        this.firebaseRef.ref().update(data).then(() => {
            console.log("Data saved successfully.");
            Keyboard.dismiss();
            this.setState({
                loading: false
            })
            this.props.navigation.navigate("FaceDetection", { group: this.group, name: this.state.name, personId: person.personId, nameKey: key })
        }).catch((error) => {
            console.log("Data could not be saved.", error);
        });
    }

    addPersonToAPI = () => {
        console.log("THIS GROUP", this.group);
        let body = {
            "name": this.state.name.trim(),
            "userData": this.state.name.trim() + "_" + this.state.age
        }
        fetch(Server.FACE_API + `persongroups/${this.group}/persons`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log("Response after add person: ", responseJson);
                if (responseJson.personId != null) {
                    this.addMemberToFireBase(responseJson)
                } else {
                    this.showError()
                }
            })
            .catch((error) => {
                console.error(error);
                this.showError()
            });
    };

    showError = () => {
        this.setState({
            loading: false
        }, () => {
            Alert.alert(
                "OOPPP",
                "Có cái gì đó không đúng rồi ",
                [
                    {
                        text: 'OK', onPress: () => {
                        }
                    }
                ],
                { cancelable: false },
            );
        });
    }

}

