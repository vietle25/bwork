import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    ActivityIndicator,
    AsyncStorage,
    FlatList,
    Image,
    Dimensions,
    Keyboard
} from "react-native";
import { Container, Tabs, Tab, ScrollableTab } from "native-base";
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import * as tenorActions from 'actions/tenorActions';
import * as commonActions from 'actions/commonActions';
import Utils from "utils/utils";
import FlatListCustom from "components/flatListCustom";
import { Constants } from "values/constants";
import BaseView from "containers/base/baseView";
import TextInputCustom from "components/textInputCustom";
import ic_cancel from 'images/ic_cancel.png';
import ImageLoader from "components/imageLoader";
import { Colors } from "values/colors";

const ITEM_GIF_HEIGHT = 100;

class GifPicker extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableLoadMore: false,
            listGifs: [],
            searchString: '',
            typing: false,
            typingTimeout: 0,
            isLoadingMore: false
        }
        this.filter = {
            paging: {
                pageSize: 10,
                page: 1
            },
            searchString: ''
        };
    }

    componentDidMount = () => {
        this.props.getGifTrending(this.filter);
        this.searchString.focus();
    };

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
                this.state.isLoadingMore = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_GIF_TRENDING)
                    || this.props.action == getActionSuccess(ActionEvent.SEARCH_GIF)) {
                    if (!Utils.isNull(data)) {
                        this.state.listGifs = [];
                        this.state.enableLoadMore = !(data.results.length < this.filter.paging.pageSize * this.filter.paging.page || data.results.length == 50);
                        if (data.results.length > 0) {
                            data.results.forEach(item => {
                                this.state.listGifs.push({ ...item.media[0] });
                            });
                        }
                        console.log("DATA GIF", this.state.listGifs)
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    /** 
     * handle gif selected 
     * @param gif 
     */
    onPressGifItem = gif => {
        this.props.onPressGifItem(gif);
    };

    render() {
        const { listGifs } = this.state;
        return (
            <View style={{ paddingHorizontal: Constants.PADDING_LARGE }}>
                <FlatListCustom
                    contentContainerStyle={{
                        height: ITEM_GIF_HEIGHT
                    }}
                    data={listGifs}
                    renderItem={this.renderItem}
                    horizontal={true}
                    enableLoadMore={this.state.enableLoadMore}
                    onLoadMore={this.onLoadMore}
                    showsHorizontalScrollIndicator={false}
                />
                <View style={{ paddingHorizontal: Constants.PADDING_LARGE }}>
                    <TextInputCustom
                        refInput={input => (this.searchString = input)}
                        isInputNormal={true}
                        placeholder={"Tìm kiếm GIF trên ứng dụng..."}
                        value={this.state.searchString}
                        onChangeText={this.onChangeTextInput}
                        onSubmitEditing={() => { }}
                        returnKeyType={"search"}
                        contentLeft={ic_cancel}
                        onPressContentLeft={this.props.onClose}
                        inputNormalStyle={{
                            paddingVertical: Constants.PADDING_LARGE + Constants.MARGIN
                        }}
                    />
                </View>
                {this.state.isLoadingMore ? null : this.showLoadingBar(this.props.isLoading)}
            </View>
        );
    }

    /**
     * Manager text input search 
     * @param {*} searchString 
     */
    onChangeTextInput = (searchString) => {
        const self = this;
        if (self.state.typingTimeout) {
            clearTimeout(self.state.typingTimeout)
        }
        this.setState({
            searchString: searchString == "" ? null : searchString,
            typing: false,
            typingTimeout: setTimeout(() => {
                if (!Utils.isNull(searchString)) {
                    this.onSearch(searchString)
                } else {
                    this.filter.paging.page = 1;
                    this.props.getGifTrending(this.filter);
                }
            }, 1000)
        });
    }

    /**
     * On search
     */
    onSearch(text) {
        this.filter.paging.page = 1;
        this.filter.searchString = text;
        this.props.searchGif(this.filter);
    }

    /**
     * Render item
     */
    renderItem = (item, index, parentIndex, indexInParent) => {
        return (
            <GifItem
                item={item}
                onPress={this.onPressGifItem}
            />
        )
    }

    //onLoadMore
    onLoadMore = () => {
        if (!this.props.isLoading && this.filter.paging.page < 5) {
            this.state.isLoadingMore = true;
            this.filter.paging.page += 1;
            if (!Utils.isNull(this.state.searchString)) {
                this.props.searchGif(this.filter);
            } else {
                this.props.getGifTrending(this.filter);
            }
        }
    }
}

const GifItem = React.memo(({ item, onPress }) => {
    let url = item.gif.url;
    let width = item.gif.dims[0];
    let height = item.gif.dims[1];
    return (
        <TouchableOpacity
            onPress={() => onPress(url)}
            style={{ marginHorizontal: Constants.MARGIN_LARGE }}>
            <ImageLoader
                path={url}
                style={{ backgroundColor: Colors.COLOR_BLACK, width: ITEM_GIF_HEIGHT / height * width, height: ITEM_GIF_HEIGHT }}
                resizeModeType={'contain'}
            />
        </TouchableOpacity>
    );
})

const mapStateToProps = state => ({
    data: state.gifPicker.data,
    isLoading: state.gifPicker.isLoading,
    error: state.gifPicker.error,
    errorCode: state.gifPicker.errorCode,
    action: state.gifPicker.action
});

const mapDispatchToProps = {
    ...tenorActions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(GifPicker);

