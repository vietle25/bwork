import {Component} from 'react';
import {Dimensions, Modal, Platform, Text, TouchableWithoutFeedback, View} from 'react-native';
import commonStyles from 'styles/commonStyles';
import {Colors} from 'values/colors';
const {OS} = Platform;
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
export const DIALOG_WIDTH = width / 1.2;

class Dialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible,
        };
        this.onRequestClose = this.onRequestClose.bind(this);
    }

    renderContent() {
        const {renderContent, contentStyle} = this.props;

        return (
            <View
                style={[
                    {
                        width: DIALOG_WIDTH,
                        padding: 0,
                        paddingTop: 0,
                    },
                    contentStyle,
                ]}>
                {renderContent && renderContent(this.state.visible)}
            </View>
        );
    }

    renderTitle() {
        const {title, titleStyle} = this.props;

        const textAlign = OS === 'ios' ? 'center' : null;

        if (title) {
            return (
                <Text
                    style={[
                        {
                            textAlign,
                            ...commonStyles.textBold,
                            color: '#000000DD',
                            // fontSize:Fonts.FONT_SIZE_MEDIUM ,
                            margin: 24,
                            marginBottom: 8,
                            textAlign: 'center',
                        },
                        titleStyle,
                    ]}>
                    {title}
                </Text>
            );
        }
    }

    renderButtons() {
        const {buttons, buttonsStyle} = this.props;

        const containerStyle =
            OS === 'ios'
                ? {}
                : {
                      width: '100%',
                      paddingLeft: 24,
                      paddingRight: 8,
                      paddingTop: 8,
                      paddingBottom: 8,
                  };

        if (buttons) return <View style={[containerStyle, buttonsStyle]}>{buttons}</View>;
    }

    _renderOutsideTouchable(onTouch) {
        const view = <View style={{flex: 1, width: '100%'}} />;

        // if (!onTouch) return view;

        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    this.showDialog(false);
                    onTouch && onTouch();
                }}
                style={{flex: 1, width: '100%'}}>
                {view}
            </TouchableWithoutFeedback>
        );
    }

    render() {
        const {
            dialogStyle,
            animationType,
            onRequestClose,
            onShow,
            onOrientationChange,
            onTouchOutside,
            overlayStyle,
            supportedOrientations,
        } = this.props;

        const dialogBackgroundColor = Colors.COLOR_WHITE;
        const dialogBorderRadius = OS === 'ios' ? 5 : 1;

        return (
            <Modal
                animationType={animationType}
                transparent={true}
                visible={this.state.visible}
                onRequestClose={() => {}}
                // onRequestClose={this.onRequestClose}
                onShow={onShow}
                onOrientationChange={onOrientationChange}
                supportedOrientations={supportedOrientations}>
                <View
                    style={[
                        {
                            flex: 1,
                            backgroundColor: '#000000AA',
                            padding: 0,
                            alignItems: 'center',
                        },
                        overlayStyle,
                    ]}>
                    {this._renderOutsideTouchable(onTouchOutside)}

                    <View
                        style={[
                            {
                                backgroundColor: dialogBackgroundColor,
                                // width: '100%',
                                width: DIALOG_WIDTH,
                                shadowOpacity: 0.24,
                                borderRadius: dialogBorderRadius,
                                elevation: 4,
                                shadowOffset: {
                                    height: 4,
                                    width: 2,
                                },
                            },
                            dialogStyle,
                        ]}>
                        {this.renderTitle()}

                        {this.renderContent()}

                        {this.renderButtons()}
                    </View>

                    {this._renderOutsideTouchable(onTouchOutside)}
                </View>
            </Modal>
        );
    }

    onRequestClose() {
        const {onRequestClose} = this.props;
        this.showDialog(false);
        onRequestClose && onRequestClose();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            visible: nextProps.visible,
        });
    }

    showDialog(show = true) {
        this.setState({
            visible: show,
        });
    }
}

export default Dialog;
