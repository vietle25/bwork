import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as actions from 'actions/userActions';
import ImageLoader from 'components/imageLoader';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import {Container, Content} from 'native-base';
import {BackHandler, Dimensions, Linking, RefreshControl, Text, View} from 'react-native';
import HTML from 'react-native-render-html';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import {Fonts} from 'values/fonts';
import styles from './styles';

const window = Dimensions.get('window');

class CompanyDetailView extends BaseView {
    constructor(props) {
        super(props);
        const {navigation, route} = this.props;
        this.state = {
            enableRefresh: true,
            refreshing: true,
        };
        this.companyId = route.params.companyId;
        this.company = null;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.getSourceUrlPath();
        this.props.getCompanyDetail(this.companyId);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.refreshing = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_COMPANY_DETAIL)) {
                    this.company = data;
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
     * Handle refresh
     */
    handleRefresh = () => {
        this.state.refreshing = true;
        this.props.getCompanyDetail(this.companyId);
    };

    render() {
        const {refreshing, enableRefresh} = this.state;
        let hasHttp = false;
        let avatarCompany = '';
        if (!Utils.isNull(this.company)) {
            hasHttp = !Utils.isNull(this.company.avatarPath) && this.company.avatarPath.indexOf('http') != -1;
            avatarCompany = hasHttp
                ? this.company.avatarPath
                : this.resourceUrlPathResize.textValue + '=' + global.companyIdAlias + '/' + this.company.avatarPath;
        }
        return (
            <Container style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            title: 'Thông tin công ty',
                            titleStyle: {color: Colors.COLOR_WHITE},
                        })}
                    </HStack>
                    <Content
                        showsVerticalScrollIndicator={false}
                        enableRefresh={enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }>
                        {!Utils.isNull(this.company) && (
                            <View style={{padding: Constants.PADDING_X_LARGE}}>
                                <View style={[commonStyles.viewCenter]}>
                                    <ImageLoader
                                        style={[styles.imageSize]}
                                        resizeAtt={
                                            hasHttp
                                                ? null
                                                : {
                                                      type: 'thumbnail',
                                                      width: window.width / 3,
                                                      height: window.width / 3,
                                                  }
                                        }
                                        resizeModeType={'cover'}
                                        path={avatarCompany}
                                    />
                                    <Text style={[commonStyles.text, {fontSize: Fonts.FONT_SIZE_X_LARGE}]}>
                                        {this.company.name}
                                    </Text>
                                </View>
                                <Text style={[commonStyles.textBold]}>
                                    {'Địa chỉ: '}
                                    <Text style={[commonStyles.text, {fontWeight: 'normal'}]}>
                                        {this.company.address}
                                    </Text>
                                </Text>
                                <Text style={[commonStyles.textBold]}>
                                    {'Điện thoại: '}
                                    <Text style={[commonStyles.text, {fontWeight: 'normal'}]}>
                                        {this.company.phone1}
                                    </Text>
                                </Text>
                                <Text style={[commonStyles.textBold]}>
                                    {'Website: '}
                                    <Text
                                        onPress={() => {
                                            this.props.navigation.navigate('QuestionAnswer', {
                                                actionTarget: {url: this.company.website},
                                            });
                                        }}
                                        style={[commonStyles.text, {fontWeight: 'normal', color: Colors.COLOR_BLUE}]}>
                                        {this.company.website}
                                    </Text>
                                </Text>
                                <HTML
                                    html={this.company.description}
                                    style={{}}
                                    containerStyle={{padding: Constants.PADDING}}
                                    imagesMaxWidth={window.width - Constants.MARGIN_XX_LARGE}
                                    onLinkPress={(evt, href) => {
                                        Linking.openURL(href);
                                    }}
                                />
                            </View>
                        )}
                    </Content>
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </View>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    data: state.companyDetail.data,
    isLoading: state.companyDetail.isLoading,
    error: state.companyDetail.error,
    errorCode: state.companyDetail.errorCode,
    action: state.companyDetail.action,
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(CompanyDetailView);
