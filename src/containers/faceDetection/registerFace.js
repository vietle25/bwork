
import React, {Component} from 'react';
import {View, TextInput, Image, StyleSheet, Text, ImageBackground, TouchableOpacity, TouchableHighlight, Keyboard, SafeAreaView, BackHandler, Dimensions, NativeModules, NativeEventEmitter, Alert} from 'react-native';
import {Container, Form, Content, Item, Input, Button, Right, Icon, Header, Root, Left, Body, Title, Toast} from 'native-base';
import StringUtil from 'utils/stringUtil';
import styles from '../login/styles';
import {localizes} from 'locales/i18n';
import BaseView from "containers/base/baseView";
import * as actions from 'actions/userActions';
import * as commonActions from 'actions/commonActions';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import {Fonts} from 'values/fonts';
import {Constants} from 'values/constants';
import {Colors} from 'values/colors';
import {ErrorCode} from 'config/errorCode';
import Utils from 'utils/utils';
import StorageUtil from 'utils/storageUtil';
import {dispatch} from 'rxjs/internal/observable/pairs';
import {StackActions, NavigationActions} from 'react-navigation'
import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import {GoogleSignin, GoogleSigninButton, statusCodes} from 'react-native-google-signin';
import {AccessToken, LoginManager, GraphRequest, GraphRequestManager, LoginButton} from 'react-native-fbsdk';
import GenderType from 'enum/genderType';
import statusType from 'enum/statusType';
import screenType from 'enum/screenType';
import firebase from 'react-native-firebase';
import bannerType from 'enum/bannerType';
import TextInputCustom from 'components/textInputCustom';
import {configConstants} from 'values/configConstants';
import {colors} from 'containers/demo/styles/index.style';
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

export default class RegisterFace extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            filePath: null,
            name: "",
            userData: "",
            visibleAge: false,
            age: "",
            addFace: false,
            personFace: ""
        }
        const {type, callBack} = this.props.navigation.state.params;
        this.type = type;
        this.callBack = callBack;
        console.log("THIS TYPE IN REGISTER VIEW: ", this.props);
        this.firebaseRef = firebase.database();
        this.personGroup = "";
        this.personId = null;
    }

    componentDidMount () {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton)
    }

    UNSAFE_componentWillReceiveProps (nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    componentWillUnmount () {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
      * Handle data when request
      */
    handleData () {
        let data = this.props.data;

    }

    renderRightHeader = () => {
        return (
            <View style={{padding: Constants.PADDING_X_LARGE + Constants.PADDING}} />
        )
    }

    renderCreateGroup () {
        return (
            <View style={[styles.container]}>
                <Text>{this.personId}</Text>
                <TextInput
                    placeholder={"Nhập tên group"}
                    placeholderTextColor={Colors.COLOR_BACKGROUND}
                    returnKeyType={"done"}
                    style={[commonStyles.text, {
                        color: Colors.COLOR_WHITE,
                        elevation: 0,
                        padding: 0,
                        margin: 0,
                        height: Constants.HEIGHT_INPUT,
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
                <TouchableOpacity
                    onPress={() => {
                        this.createGroup();
                    }}
                    style={{
                        width: deviceWidth * 0.7,
                        alignItems: 'center',
                        marginVertical: Constants.MARGIN_X_LARGE,
                        backgroundColor: Colors.COLOR_WHITE,
                        paddingVertical: Constants.PADDING_LARGE,
                        paddingHorizontal: Constants.PADDING_XX_LARGE,
                        borderRadius: Constants.CORNER_RADIUS / 2
                    }}>
                    <Text>Tạo group</Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderCreatePerson = () => {
        return (
            <View style={[styles.container]}>
                <Text>{this.personId}</Text>
                <TextInput
                    placeholder={"Cho biết tên đi mai phen"}
                    placeholderTextColor={Colors.COLOR_BACKGROUND}
                    returnKeyType={"done"}
                    style={[commonStyles.text, {
                        color: Colors.COLOR_WHITE,
                        elevation: 0,
                        padding: 0,
                        margin: 0,
                        height: Constants.HEIGHT_INPUT,
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
                    onSubmitEditing={() => {
                        this.setState({
                            visibleAge: true
                        })
                    }}
                    underlineColorAndroid={Colors.COLOR_BACKGROUND}
                />
                {this.state.visibleAge ?
                    <TextInput
                        placeholder={"Cho biết tuổi nữa bồ"}
                        placeholderTextColor={Colors.COLOR_BACKGROUND}
                        returnKeyType={"done"}
                        style={[commonStyles.text, {
                            color: Colors.COLOR_WHITE,
                            elevation: 0,
                            padding: 0,
                            margin: 0,
                            height: Constants.HEIGHT_INPUT,
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
                        underlineColorAndroid={Colors.COLOR_BACKGROUND}
                    />
                    : null}

                <TouchableOpacity
                    onPress={() => {
                        this.addMemberToFireBase();
                    }}
                    style={{
                        width: deviceWidth * 0.7,
                        alignItems: 'center',
                        marginVertical: Constants.MARGIN_X_LARGE,
                        backgroundColor: Colors.COLOR_WHITE,
                        paddingVertical: Constants.PADDING_LARGE,
                        paddingHorizontal: Constants.PADDING_XX_LARGE,
                        borderRadius: Constants.CORNER_RADIUS / 2
                    }}>
                    <Text>Gia nhập</Text>
                </TouchableOpacity>
            </View>);
    }

    render () {
        if (this.type == 1) {
            return (this.renderCreateGroup());
        } else {
            return (this.renderCreatePerson());
        }
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
                this.callBack(this.state.name)
                Alert.alert(
                    localizes('notification'),
                    "Tạo person group thành công",
                    [
                        {
                            text: 'OK', onPress: () => {
                                this.onBack()

                            }
                        }
                    ],
                    {cancelable: false},
                );
                let data = {
                    [`${this.state.name}`]: {
                        "groupName": this.state.name
                    },
                }
                this.firebaseRef.ref().update(data).then(() => {
                    console.log("Data saved successfully.");
                    Keyboard.dismiss();
                }).catch((error) => {
                    console.log("Data could not be saved.", error);
                });
            } else {
                Alert.alert(
                    "OOPPP",
                    "Có cái gì đó không đúng rồi ",
                    [
                        {
                            text: 'OK', onPress: () => {
                                this.onBack()
                            }
                        }
                    ],
                    {cancelable: false},
                );
            }
        })
            .catch((error) => {
                console.error(error);
            });
    }

    trainingAPI = () => {
        fetch(Server.FACE_API + `persongroups/${this.personGroup}/train`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
        }).then((response) => response)
            .then((responseJson) => {
                console.log("Response after training: ", responseJson);
                if (responseJson.status != 202) {
                    this.showMessage("training thành công, test đi")
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }


    /**
    * Upload image
    */

    uploadImage = (uri) => {
        console.log("URI BEFORE UPLOAD: ", uri);
        let fr = FireBaseStorage.ref(`tutorials`);
        fr.putFile(uri, {contentType: 'image/jpeg'}).on(
            storage.TaskEvent.STATE_CHANGED,
            async snapshot => {
                console.log("FIRE BASE SNAPSHOT", snapshot)
            },
            error => {
                setError(error);
            }
        );
    };


    /**
    * Show document picker
    */
    showDocumentPicker = async fileType => {
        ImagePicker.showImagePicker(options, response => {
            if (response.didCancel) {
                console.log('You cancelled image picker 😟');
            } else if (response.error) {
                alert('And error occured: ', response.error);
            } else {
                const source = {uri: response.uri};
                console.log("URI IMAGE PICKER: ", response.uri)
                this.setState({
                    filePath: response.uri
                });
                let uriArray = response.uri.split("/");
                let url = uriArray[uriArray.length - 1];
                let fr = FireBaseStorage.ref(`face${url}`);
                fr.putFile(response.uri, {contentType: 'image/jpeg'}).on(
                    storage.TaskEvent.STATE_CHANGED,
                    snapshot => {
                        console.log("FIRE BASE SNAPSHOT", snapshot)
                        if (snapshot.state == "success") {
                            fr.getDownloadURL().then((urls) => {
                                console.log(urls);
                                this.setState({personFace: urls})

                            });
                        }
                    },
                    error => {
                        setError(error);
                    }
                );

            }
        });
    };

    addMemberToFireBase = () => {
        let key = this.state.name.replace(/ /g, "_");
        let data = {
            [`faces_test/${key}`]: {
                name: this.state.name,
            },
        }
        this.setState({
            userData: key,
        })
        this.firebaseRef.ref().update(data).then(() => {
            console.log("Data saved successfully.");
            Keyboard.dismiss();
            this.showMessage("Mày đã được ghim")
            this.addPersonToAPI();
        }).catch((error) => {
            console.log("Data could not be saved.", error);
        });
    }

    addPersonToAPI = () => {
        let body = {
            "name": this.state.name,
            "userData": this.state.userData
        }
        console.log("BODY REQUEST FACE API: ", body)
        fetch(Server.FACE_API + 'persongroups/face_test/persons', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((response) => response.json())
            .then((responseJson) => {
                this.personId = responseJson.personId
                this.setState({
                    addFace: true
                })
                console.log("Response after add person: ", responseJson.personId);
                if (responseJson.personId != null) {
                    this.updateMemberFireBase(responseJson.personId);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    updateMemberFireBase = (personId) => {
        let key = this.state.name.replace(/ /g, "_");
        let data = {
            personId: personId
        }
        this.setState({
            userData: key,
        })
        this.firebaseRef.ref(`faces_test/${key}`).update(data).then(() => {
            console.log("Update person Id lên firebase thành công.");
            this.showMessage("Update person Id lên firebase thành công")
        }).catch((error) => {
            console.log("Data could not be saved.", error);
        });
    }

    addFaceToPerson = (url) => {
        let body = {
            "url": url
        }
        console.log("BODY REQUEST FACE API: ", body)
        fetch(Server.FACE_API + `persongroups/face_test/persons/${this.personId}/persistedFaces?userData=${this.state.userData}&detectionModel=detection_02`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log("Response after add face: ", responseJson);
                if (Object.keys(responseJson)[0] === "error")
                    this.showMessage(responseJson.error.message)
                else {
                    this.showMessage("Đăng kí khuôn mặt cho person thành công")
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }
}

