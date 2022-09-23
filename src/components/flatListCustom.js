'use strict';
import React, { Component } from "react";
import PropTypes from 'prop-types';
import {
    ImageBackground, View, StatusBar, TextInput,
    ScrollView, TouchableOpacity, Modal, Image, Dimensions, FlatList, ActivityIndicator,
    Animated
} from "react-native";
import {
    Form, Textarea, Container, Header, Title, Left, Icon, Right,
    Button, Body, Content, Text, Card, CardItem,
    Fab, Footer, Input, Item, Toast, ActionSheet, Root
} from "native-base";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import { Fonts } from "values/fonts";
import img_error_404 from 'images/img_error_404.png';

export default class FlatListCustom extends Component {

    constructor(props) {
        super(props)
        this.horizontal = props.horizontal ? props.horizontal : false
        let data = this.getParentData(props)
        this.state = {
            data: data,
            isRefreshing: false,
            height: -1,
        };
        this.maxHeight = -1;
        this.maxWidth = -1;
        this.childData = [];
        this.isLoadFirstTime = true;
        this.onEndReachedCalledDuringMomentum = true;
    }

    onLayout(event) {

    }

    render = () => {
        if (!this.state.data)
            throw new Error('No data found, please try again')

        return (
            <Animated.FlatList
                {...this.props}
                ref={(ref) => {
                    if (this.props.onRef)
                        this.props.onRef(ref)
                }}
                onLayout={this.onLayout.bind(this)}
                data={this.getParentData(this.props)}
                renderItem={({ item, index }) => {
                    return (this.renderItem(item.data, index))
                }}
                keyExtractor={(item, index) => item.parentIndex.toString()}
                ListFooterComponent={() => this.props.enableLoadMore
                    ? this.renderFooter()
                    : this.props.ListFooterComponent ? this.props.ListFooterComponent() : null}
                ListEmptyComponent={() => this.props.isShowEmpty ? this.renderEmptyComponent(this.props.styleEmpty) : null}
                onMomentumScrollBegin={() => {
                    this.onEndReachedCalledDuringMomentum = false;
                }}
                onEndReached={({ distanceFromEnd }) => {
                    if (!this.props.isUsedOnEndReachedDuringMomentum) {
                        if (this.props.enableLoadMore) {
                            if (this.props.onLoadMore) {
                                this.props.onLoadMore();
                            }
                        }
                    } else {
                        if (!this.onEndReachedCalledDuringMomentum && this.props.enableLoadMore) {

                            if (this.props.onLoadMore) {
                                this.props.onLoadMore();
                            }
                            this.onEndReachedCalledDuringMomentum = true;
                        }
                    }
                }}
                refreshControl={this.props.enableRefresh ? this.props.refreshControl : null}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                initialListSize={200}
                extraData={this.state}
                keyboardShouldPersistTaps='always' //The keyboard will not dismiss automatically, and the scroll view will not catch taps, but children of the scroll view can catch taps.
            />
        )
    }

    /**
     * Render empty component
     */
    renderEmptyComponent = (style) => {
        return (
            <View style={[styles.textEmpty, style, { backgroundColor: Colors.COLOR_WHITE }]}>
                {this.props.isShowImageEmpty
                    ? <Image source={img_error_404} style={{ marginTop: Constants.PADDING_XX_LARGE * 2, marginRight: Constants.MARGIN_XX_LARGE }} />
                    : null
                }
                <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_SMALL, marginBottom: Constants.PADDING_XX_LARGE * 2 }]}>
                    {this.props.textForEmpty}
                </Text>
            </View>
        )
    }

    /**
     * Render footer (load more)
     */
    renderFooter = () => {
        let defaultStyle = [styles.footer]
        return (<View
            style={defaultStyle}>
            <ActivityIndicator color={Colors.COLOR_PRIMARY} animating size="large" />
        </View>)
    }

    get itemData() {
        const { itemPerRow, itemPerCol } = this.props
        let itemData = 1
        if (itemPerRow || itemPerRow) {
            //Vertical
            if (itemPerRow && !this.horizontal) {
                itemData = itemPerRow
            } else if (itemPerCol && this.horizontal) {
                itemData = itemPerCol
            }
        }
        return itemData
    }

    getParentData(props) {
        if (!props.data)
            throw new Error('No data found, please try again')
        let data = []
        if (this.itemData === 1) {
            data = props.data.map((item, index) => {
                return { data: [item], parentIndex: index }
            })
        } else {
            let itemPerData = this.itemData;
            let array = props.data
            for (let i = 0, size = array.length / itemPerData; i < size; i++) {
                let rowOrCol = { data: [], parentIndex: i };
                for (let j = 0; j < itemPerData; j++) {
                    let newIndex = i * itemPerData + j;
                    if (newIndex >= array.length) {
                        break;
                    }
                    rowOrCol.data.push(array[newIndex]);
                }
                if (rowOrCol.length !== 0)
                    data.push(rowOrCol);
            }
        }
        return data
    }

    onLayoutChild(event) {
        const childHeight = event.nativeEvent.layout.height
        const childWidth = event.nativeEvent.layout.width
        if (childHeight > this.maxHeight)
            this.maxHeight = childHeight
        if (childWidth > this.maxWidth)
            this.maxWidth = childWidth
    }

    onLoadDone() {
        if (this.isLoadFirstTime) {
            this.setState({
                data: this.state.data
            })
            this.isLoadFirstTime = false
        }
    }

    renderItem(parentData, parentIndex) {
        const itemData = this.itemData
        let directionStyle = this.horizontal ? styles.vertical : styles.horizontal
        let flex = 1 / itemData
        let dimensionStyle = {}
        let viewPerRow = parentData.map((item, index) => {
            const indexInData = parentIndex * itemData + index
            return (<View key={index} style={{
                flex: flex,
            }}
            >{this.props.renderItem(item, indexInData, parentIndex, index)}</View>)
        })
        return (
            <View style={styles.vertical}>
                <View style={directionStyle} key={parentIndex}>
                    {viewPerRow}
                </View>
                {parentIndex !== this.state.data.length - 1 ? (this.props.renderParentLine ? this.props.renderParentLine(this.horizontal) : null) : null}
            </View>
        );
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            this.maxHeight = -1
            this.maxWidth = -1
            this.isLoadFirstTime = true
            let data = this.getParentData(nextProps)
            this.setState({
                data: data
            })
        }
    }
}

FlatListCustom.defaultProps = {
    onLoadMore: null,
    onRefresh: null,
    enableLoadMore: false,
    enableRefresh: false,
    itemPerRow: 1,
    itemPerCol: 1,
    renderParentLine: null,
}

FlatListCustom.propTypes = {
    data: PropTypes.array.isRequired,
    keyExtractor: PropTypes.func,
    renderItem: PropTypes.func,
    enableLoadMore: PropTypes.bool,
    enableRefresh: PropTypes.bool,
    onLoadMore: PropTypes.func,
    onRefresh: PropTypes.func,
    itemPerRow: PropTypes.number,
    itemPerCol: PropTypes.number,
    renderParentLine: PropTypes.func
}

const styles = {
    footer: {
        ...commonStyles.viewCenter,
        flex: 1,
        marginVertical: Constants.MARGIN_X_LARGE,
    },
    lastItem: {
        marginBottom: 0,
    },
    horizontal: {
        flexDirection: 'row',
        flex: 1,
    },
    vertical: {
        flexDirection: 'column',
        flex: 1,
    },
    textEmpty: {
        ...commonStyles.viewCenter
    }
}