import BaseView from "containers/base/baseView";
import { localizes } from "locales/i18n";
import {
    Container, Header, Root, Text
} from "native-base";
import { BackHandler, Dimensions, ImageBackground, Platform, View } from "react-native";
import firebase from 'react-native-firebase';
import commonStyles from "styles/commonStyles";
import Utils from 'utils/utils';
import { Colors } from "values/colors";
import { Constants } from "values/constants";
// import { RNCamera } from 'react-native-camera';
import DialogCustom from "components/dialogCustom";
import ServerPath from "config/Server";
import img_bottom_vignette from 'images/img_bottom_vignette.png';
import Upload from "react-native-background-upload";
import { configConstants } from 'values/configConstants';
import styles from "./styles";

const width = Dimensions.get('window').width
const screen = Dimensions.get('window')
const height = Dimensions.get('window').height
const halfWidth = width / 2;
const halfHeight = height / 2;
const NUM_FACE = 3
const MAX_SCAN_FACE = 3;
export default class FaceDetectionView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            fd: true,
            height: 0,
            width: 0,
            x: 0, y: 0,
            isFinish: false,
            isLoading: false,
            personId: null,
            namePerson: "",
            identify: false,
            confidence: 0,
            userData: null,
            isAlert: false
        };
        const { type, group, personId, name, nameKey, confidenceThreshold, callback, personIdOfUser } = this.props.navigation.state.params;
        this.type = type;
        this.name = name;
        this.group = group;
        this.nameKey = nameKey;
        this.personId = personId;
        this.arrayFace = [];
        this.faceDetec = [];
        this.take = null;
        this.center = {
            x: 0,
            y: 0
        }
        this.numFace = 0
        this.firebaseRef = firebase.database();
        this.storage = firebase.storage();
        this.urlsFace = null;
        this.faceId = null;
        this.confidenceThreshold = confidenceThreshold;
        this.callback = callback;
        this.personIdOfUser = personIdOfUser;
        this.countScanFace = 1;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.getSourceUrlPath();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
     * Detect face
     */
    detectFace = (url) => {
        let body = {
            "url": url
        }
        fetch(ServerPath.FACE_API + `detect?returnFaceId=true&recognitionModel=recognition_02&returnRecognitionModel=true&detectionModel=detection_02`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((response) => response.json()).then((responseJson) => {
            console.log("Response after detectFace face : ", responseJson);
            if (responseJson.error != null) {
                this.failureIdentification();
            } else {
                if (responseJson.length > 0 && responseJson[0].faceId != null) {
                    this.faceId = responseJson[0].faceId
                    console.log("Response after detectFace face zzzzz : ", this.faceId);
                    this.recognizeFace(this.faceId);
                } else {
                    this.failureIdentification();
                }
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Recognize face
     */
    recognizeFace = (faceId) => {
        let body = {
            "personGroupId": this.group,
            "faceIds": [
                faceId
            ],
            "maxNumOfCandidatesReturned": 1,
            "confidenceThreshold": this.confidenceThreshold
        }
        fetch(ServerPath.FACE_API + `identify`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((response) => response.json()).then((responseJson) => {
            console.log("Response after identify face : ", responseJson);
            if (responseJson.error != null) {
                this.failureIdentification();
            } else {
                if (responseJson[0].candidates.length > 0) {
                    console.log("Response after identify face zzzzz : ", responseJson[0].candidates[0]);
                    this.setState({
                        personId: responseJson[0].candidates[0].personId,
                        confidence: responseJson[0].candidates[0].confidence
                    })
                    this.getPersonInfo(responseJson[0].candidates[0].personId);
                    if (responseJson[0].candidates[0].confidence >= this.confidenceThreshold
                        && responseJson[0].candidates[0].personId === this.personIdOfUser) {
                        this.callback && this.callback(this.countScanFace, responseJson[0].candidates[0].confidence);
                        this.onBack();
                    } else {
                        if (this.countScanFace >= 3) {
                            this.callback && this.callback(this.countScanFace, 0);
                            this.onBack();
                        } else {
                            this.failureIdentification();
                        }
                    }
                } else {
                    this.failureIdentification();
                }
            }

        }).catch((error) => {
            console.error(error);
        });
    }


    /**
     * Failure identification
     */
    failureIdentification = () => {
        if (this.countScanFace >= 3) {
            this.callback && this.callback(this.countScanFace, 0);
            this.onBack();
        } else {
            this.setState({ isAlert: true });
        }
    }

    /**
     * Render alert
     */
    renderAlert() {
        return (
            <DialogCustom
                visible={this.state.isAlert}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleOneButton={true}
                contentTitle={localizes("notification")}
                textBtn={localizes("yes")}
                contentText={"Nhận diện không thành công, vui lòng thử lại!"}
                onPressBtn={() => {
                    this.countScanFace += 1;
                    this.setState({ isLoading: false, isAlert: false });
                }}
            />
        );
    }

    /**
     * Get person info
     */
    getPersonInfo = (personId) => {
        console.log("getPersonInfo : ", ServerPath.FACE_API + `persongroups/${this.group}/persons/${personId}`);
        fetch(ServerPath.FACE_API + `persongroups/${this.group}/persons/${personId}`, {
            method: 'GET',
            headers: {
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API
            },
        }).then((response) => response.json()).then((responseJson) => {
            console.log("Respone after getPersonInfo face : ", responseJson);
            if (responseJson.error != null) {

            } else {
                this.setState({
                    personId: responseJson.personId,
                    namePerson: responseJson.name,
                    userData: responseJson.userData,
                    identify: true
                })
            }

        }).catch((error) => {
            console.error(error);
        });
    }


    /**
     * TODO: take a picture, then upload pic to FireStore, get url of pic
     * TODO: call api add face to person. Then 
     * 
     */
    /**
     * take a picture
     */
    takePicture = async () => {
        if (this.camera) {
            let option = {
                width: 480,
                height: 720,
                quality: 0.3,
                fixOrientation: true,
                orientation: "portrait"
            }
            this.camera.takePictureAsync(option).then((data) => {
                if (data != null) {
                    console.log(" data take picture react-native-camera zzzzz", data.uri);
                    this.uploadImage(data.uri)
                }
            })
        };
    };

    /**
     * Upload image
     */
    uploadImage = (uri) => {
        let uriReplace = uri;
        if (Platform.OS == "android") {
            uriReplace = uriReplace.replace('file://', '');
        };
        let file = {
            fileType: "image/*",
            filePath: uriReplace
        };
        console.log("URI: ", file.filePath);
        const options = {
            url: ServerPath.API_URL + "timekeeping/upload/image-path",
            path: file.filePath,
            method: "POST",
            field: "file",
            type: "multipart",
            headers: {
                "Content-Type": "application/json", // Customize content-type
                "X-APITOKEN": global.token
            },
            notification: {
                enabled: true,
                onProgressTitle: "Đang nhận diện...",
                autoClear: true
            }
        };
        Upload.startUpload(options).then(uploadId => {
            console.log("Upload started");
            Upload.addListener("progress", uploadId, data => {
                console.log(`Progress: ${data.progress}%`);
            });
            Upload.addListener("error", uploadId, data => {
                console.log(`Error: ${data.error}%`);
                this.failureIdentification();
            });
            Upload.addListener("cancelled", uploadId, data => {
                console.log(`Cancelled!`);
            });
            Upload.addListener("completed", uploadId, data => {
                // data includes responseCode: number and responseBody: Object
                console.log("Completed!", data);
                if (!Utils.isNull(data.responseBody)) {
                    let result = JSON.parse(data.responseBody);
                    let urls = this.resourceUrlPath.textValue + "/" + global.companyIdAlias + "/" + result.data;
                    if (this.type == 0) {
                        this.detectFace(urls);
                    } else {
                        this.addFaceToPerson(urls);
                    }
                } else {
                    this.failureIdentification();
                }
            });
        }).catch(error => {
            console.log(error);
        });
    };

    /**
     * Add face to person
     */
    addFaceToPerson = (url) => {
        let body = {
            "url": url
        }
        fetch(ServerPath.FACE_API + `persongroups/${this.group}/persons/${this.personId}/persistedFaces?userData=${this.name}&detectionModel=detection_02`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((response) => response.json()).then((responseJson) => {
            console.log("Response after add face zzzzz : ", responseJson);
            if (Object.keys(responseJson)[0] === "error") {
                this.showMessage(responseJson.error.message)
                this.setState({
                    isLoading: false
                })
                console.log("Đăng kí khuôn mặt cho perso thât bại zzzzz", responseJson);
            }
            else {
                console.log("Đăng kí khuôn mặt cho person thành công zzzzz", responseJson);
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Update person firebase
     */
    updatePersonFireBase = (face, url) => {
        let key = this.name.replace(/ /g, "_");
        let data = {
            face: face,
            url: url
        }
        this.firebaseRef.ref(`${this.group}/${this.nameKey}/persistedFaceIds`).push(face).then(() => {
            console.log("Update face lên firebase thành công.");
            if (this.numFace < NUM_FACE) {
                this.numFace += 1;
                console.log("Upload thành công khuôn mặt thứ: ", this.numFace);
            } else {
                this.setState({
                    isFinish: true
                })
            }
            this.setState({
                isLoading: false
            })
        }).catch((error) => {
            console.log("Data could not be saved.", error);
        });
    }

    render() {
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            visibleBack: false,
                            title: localizes("face.title"),
                            titleStyle: { color: Colors.COLOR_WHITE }
                        })}
                    </Header>
                    <View style={{ flex: 1 }}>
                        {/* <RNCamera
                            ref={ref => {
                                this.camera = ref;
                            }}
                            type={RNCamera.Constants.Type.front}
                            captureAudio={false}
                            flashMode={RNCamera.Constants.FlashMode.on}
                            androidCameraPermissionOptions={{
                                title: 'Permission to use camera',
                                message: 'We need your permission to use your camera',
                                buttonPositive: 'Ok',
                                buttonNegative: 'Cancel',
                            }}
                            androidRecordAudioPermissionOptions={{
                                title: 'Permission to use audio recording',
                                message: 'We need your permission to use your audio',
                                buttonPositive: 'Ok',
                                buttonNegative: 'Cancel',
                            }}
                            style={{
                                flex: 1,
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                            }}
                            mirrorImage={false}
                            faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.fast}
                            faceDetectionClassifications={RNCamera.Constants.FaceDetection.Classifications.all}
                            faceDetectionLandmarks={RNCamera.Constants.FaceDetection.Landmarks.all}
                            onFacesDetected={(face) => {
                                if (face.faces.length > 0 && !this.state.isAlert) {
                                    this.setState({
                                        width: face.faces[0].bounds.size.width,
                                        height: face.faces[0].bounds.size.height,
                                        x: face.faces[0].bounds.origin.x,
                                        y: face.faces[0].bounds.origin.y
                                    });
                                } else {
                                    this.setState({
                                        width: 0,
                                        height: 0,
                                        x: 0,
                                        y: 0
                                    })
                                }
                                if (this.type != 0) {
                                    if (!this.state.isFinish) {
                                        if (face.faces.length > 0) {
                                            if (this.state.isLoading == false) {
                                                if (this.numFace < NUM_FACE) {
                                                    console.log("FACE DETECTED react-native-camera zzzzz", face);
                                                    this.setState({
                                                        isLoading: true
                                                    }, () => {
                                                        this.takePicture()
                                                    })
                                                } else {
                                                    Alert.alert(
                                                        localizes('notification'),
                                                        "ĐĂng kí xong rồi",
                                                        [
                                                            {
                                                                text: 'OK', onPress: () => {
                                                                }
                                                            }
                                                        ],
                                                        { cancelable: false },
                                                    );
                                                    this.onBack()
                                                }
                                            }
                                        }
                                    } else {
                                        this.onBack()
                                        Alert.alert(
                                            localizes('notification'),
                                            "ĐĂng kí xong rồi",
                                            [
                                                {
                                                    text: 'OK', onPress: () => {


                                                    }
                                                }
                                            ],
                                            { cancelable: false },
                                        );

                                    }
                                } else {
                                    if (face.faces.length > 0) {
                                        if (this.state.isLoading == false) {
                                            console.log("FACE DETECTED react-native-camera zzzzz", face);
                                            this.setState({
                                                isLoading: true
                                            }, () => {
                                                this.takePicture()
                                            })
                                        }
                                    }
                                }
                            }}
                        /> */}
                        {this.renderCircleFace()}
                        {this.renderGuide()}
                        {/* <View style={{ flex: 0.5, width: '100%', flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 0, left: 0 }}>
                            <TouchableOpacity style={{
                                flex: 0,
                                backgroundColor: '#fff',
                                borderRadius: 5,
                                padding: 15,
                                paddingHorizontal: 20,
                                alignSelf: 'center',
                                margin: 20,
                            }} onPress={() => { this.takePicture() }}>
                                <Text style={{ fontSize: 14 }}> SNAP </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{
                                flex: 0,
                                backgroundColor: '#fff',
                                borderRadius: 5,
                                padding: 15,
                                paddingHorizontal: 20,
                                alignSelf: 'center',
                                margin: 20,
                            }} onPress={() => { clearInterval(this.take) }}>
                                <Text style={{ fontSize: 14 }}> STOP </Text>
                            </TouchableOpacity>
                        </View> */}
                    </View>
                    {this.renderAlert()}
                </Root>
            </Container>
        );
    }

    /**
     * Render background
     */
    renderBackground() {
        return (
            <View style={{
                flex: 1, flexDirection: 'row', position: 'absolute',
                backgroundColor: 'transparent', width: width, height: height
            }}>
                <View style={{
                    flex: 1, position: 'absolute',
                    bottom: height * 0.3, left: width * 0.2,
                    borderTopLeftRadius: width * 0.6,
                    borderTopRightRadius: width * 0.6,
                    borderBottomLeftRadius: width * 0.6,
                    borderBottomRightRadius: width * 0.6,
                    borderWidth: 5, borderColor: Colors.COLOR_ORANGE,
                    backgroundColor: 'transparent', width: width * 0.6, height: height * 0.4,
                }}>
                </View>
            </View>
        );
    }

    /**
     * Render circle face
     */
    renderCircleFace() {
        return (
            <View style={{
                position: 'absolute',
                borderWidth: 2,
                borderColor: Colors.COLOR_WHITE,
                marginTop: this.state.y,
                left: this.state.x,
                backgroundColor: 'transparent',
                width: this.state.width,
                height: this.state.width
            }} />
        );
    }

    /**
     * Render guide
     */
    renderGuide = () => {
        return (
            <View style={styles.guide}>
                <ImageBackground
                    source={img_bottom_vignette}
                    style={{
                        height: null,
                        width: null,
                        padding: Constants.PADDING_X_LARGE
                    }}
                    imageStyle={{ resizeMode: 'stretch' }}>
                    <Text>{" "}</Text>
                    <Text>{" "}</Text>
                    <Text style={[commonStyles.text, { textAlign: "center", color: Colors.COLOR_WHITE }]}>
                        Đưa khuôn mặt của bạn vào gần camera để bắt đầu nhận diện!
                    </Text>
                </ImageBackground>
            </View>
        )
    }
}