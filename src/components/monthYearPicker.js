'use strict';
import React, { Component } from "react";
import PropTypes from 'prop-types';
import {
    ImageBackground, View, StatusBar, TextInput,
    ScrollView, TouchableOpacity, Modal, Image, Dimensions, FlatList, ActivityIndicator, Animated
} from "react-native";
import {
    Form, Textarea, Container, Header, Title, Left, Icon, Right,
    Button, Body, Content, Text, Card, CardItem,
    Fab, Footer, Input, Item, Toast, ActionSheet, Root
} from "native-base";
import Dialog, { DIALOG_WIDTH } from './dialog'
import ViewPager from './viewPager'
import commonStyles from "styles/commonStyles";
import FlatListCustom from "components/flatListCustom";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import DateUtil from "utils/dateUtil";
import Utils from "utils/utils";

const MARGIN_BETWEEN_MONTH = 20

export default class MonthYearPicker extends Component {

    static defaultProps = {
        minYear: DateUtil.now().getFullYear(),
        maxYear: DateUtil.now().getFullYear() + 1,
        disablePassedMonth: true,
        monthDefault: {
            year: DateUtil.now().getFullYear(),
            month: DateUtil.now().getMonth() + 1,
        }
    }

    static propTypes = {
        minYear: PropTypes.number,
        maxYear: PropTypes.number,
        monthDefault: PropTypes.object, //Include 2 property is month and year
        disablePassedMonth: PropTypes.bool
    }

    constructor(props) {
        super(props)
        this.setEssentialData(props)
        this.renderItem = this.renderItem.bind(this)
        this.onIndexChanged = this.onIndexChanged.bind(this)
        this.selectedMonth = undefined
        this.monthRef = Array(12).fill(0).map((item, index) => {
            return {
                background: undefined,
                title: undefined,
            }
        })
        this.yearRef = []
        this.state = {
            width: DIALOG_WIDTH,
            selectedYear: 0,
            animation: new Animated.Value(0)
        }
        this.show = false
    }

    setEssentialData(props) {
        let { minYear, maxYear, disablePassedMonth } = props
        const range = maxYear - minYear + 1
        if (range <= 0)
            throw new Error('Min year is not greater than max year')
        this.yearList = Array(range).fill(0).map((item, index) => {
            return minYear + index
        })
        this.disablePassedMonth = disablePassedMonth
    }

    parentLayout(e) {
        const {width} = e.nativeEvent.layout
        if (this.state.width === 0) {
            this.setState({
                width: e.nativeEvent.layout.width
            })
        }
    }

    render() {
        return (  
            <Dialog
                contentStyle  = {{padding: 0}}
                ref = {ref => this.dialog = ref}
                visible = {this.show}
                onTouchOutside = {this.onTouchOutside.bind(this)}
                renderContent = {(show) => {
                return !show? null    
                :(<View  onLayout = 
                    {this.parentLayout.bind(this)}
                    >                   
                    <View style = {{
                            backgroundColor: Colors.COLOR_PRIMARY,
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: Constants.PADDING,
                            marginBottom: Constants.MARGIN_LARGE
                        }}>
                     {/* <ScrollView
                        pagingEnabled = {true}
                        horizontal = {true}
                        style = {{paddingVertical: 5, marginBottom: Constants.MARGIN_X_LARGE}}
                        contentContainerStyle = {{alignItems: 'center'}}
                        showsHorizontalScrollIndicator = {false}
                        onScroll={(event) => {
                            let position = (event.nativeEvent.contentOffset.x / this.state.width)
                                if (position !== this.state.selectedYear) {
                                    this.onIndexChanged(position)
                                } 
                        }}>
                        {this.yearList.map((item, index) => {
                                    return (
                                        <Text 
                                            ref = {ref => this.yearRef[index] = ref}
                                            key ={index.toString()} 
                                            style = {[commonStyles.textBold,styles.itemYear, {
                                                width: this.state.width
                                            }]}>{item}
                                        </Text>)                            })}
                        </ScrollView> */}
                     
                        {/* Title */}
                        <Text style = {[commonStyles.title, {
                                color: Colors.COLOR_WHITE,
                                fontWeight: 'bold'
                            }]}>{this.yearList[this.state.selectedYear]}</Text>
                        {/* {Left button} */}
                        <TouchableOpacity
                            style = {[styles.nextButton, {
                                left: 0
                            }]}
                            onPress = {() => {
                                this.onIndexChanged(this.state.selectedYear - 1)
                            }}
                        >
                            <Icon name = 'keyboard-arrow-left' type = 'MaterialIcons'
                            style = {{color: Colors.COLOR_WHITE}} />
                        </TouchableOpacity>
                        {/* {Right button} */}
                        <TouchableOpacity
                            style = {[styles.nextButton, {
                                right: 0
                            }]}
                            onPress = {() => {
                                this.onIndexChanged(this.state.selectedYear + 1)
                            }}
                        >
                            <Icon name = 'keyboard-arrow-right' type = 'MaterialIcons' style = {{color: Colors.COLOR_WHITE}}/>
                        </TouchableOpacity>
                    </View>
                    <Animated.View style = {[{
                        transform: [
                            {
                                translateX: this.state.animation
                            }
                        ], 
                        marginRight: Constants.MARGIN_LARGE
                        }]}>
                        {this.renderMonthList(
                            this.createMonths(this.yearList[this.state.selectedYear]))}
                    </Animated.View>
                   
                </View>)}}
                />
        )
    }

    showPicker(show = true) {
        this.dialog.showDialog(show)
        this.show = show
    }
    onTouchOutside() {
        this.show = false
    }

    onIndexChanged(index) {
        if (index >= 0 && index < this.yearList.length) {
            let initValue = index > this.state.selectedYear? -100: 100
            let finalValue = 0
            this.state.animation.setValue(initValue)
            Animated.spring(this.state.animation, {
                toValue: finalValue,
            }).start()
            this.setState({
                selectedYear: index
            })
        }
    }

    renderMonthList(data = []) {
        const itemPerRow = 4
        let views = []
        this.monthList = data
        let width = (this.state.width - MARGIN_BETWEEN_MONTH*(itemPerRow + 1))/itemPerRow
        for (let  i = 0; i < data.length/itemPerRow; i++) {
            let start = (i* itemPerRow) 
            let end = (i+1)*itemPerRow
            let rowData = data.slice(start,end)
            let viewPerRow = rowData.map((item, index) => {
                return (<View key = {index}>{this.renderItem(item, index + i*itemPerRow, i, index, width)}</View>)
            })
            views.push(
            <View key = {i} style = {{flexDirection: 'row', width: this.state.width}}>
                {viewPerRow}
            </View>)
        }
        return views
    }

    renderItem( item, index, parentIndex, indexInParent, width) {
        let parentStyle = [styles.itemMonth, {
            width: width,
            height: width,
            borderRadius: width/2
        }]
        let titleStyle = [commonStyles.title,{textAlign: 'center', marginRight: Constants.MARGIN_LARGE}]
        if (item.disabled) {
            parentStyle.push({
                backgroundColor: Colors.COLOR_GREY,
            })
        } 
        if (item.selected) {
            parentStyle.push({
                backgroundColor: Colors.COLOR_TEXT
            })
            titleStyle.push({
                color: Colors.COLOR_WHITE
            })
        }

        return (
            <TouchableOpacity
                key = {index}
                ref = {ref => this.monthRef[index].background = ref}
                disabled = {item.disabled}
                onPress = {() => {this.onPressItem(index)}}
                style = {[parentStyle,]}
            >
                <Text 
                    ref = {ref => this.monthRef[index].title = ref}
                    style = {titleStyle}> {item.month}</Text>
            </TouchableOpacity>
        )
    }

    changeItemBackground(ref ,selected =  true) {
        let backgroundColor = null
        let color = null
        //Selected background
        if (selected) {
            backgroundColor = Colors.COLOR_TEXT
            color = Colors.COLOR_WHITE
        } else {
            //Unselected background
            backgroundColor = Colors.COLOR_WHITE
            color = Colors.COLOR_TEXT
        }
        ref.background.setNativeProps({
            backgroundColor:  backgroundColor
        })
        ref.title.setNativeProps({
            style: {
                color: color
            }
        })
    }

    onPressItem(index) {
        const { onPressItem } = this.props
        let previousValue = this.selectedMonth
        if (previousValue) {
            if (this.state.selectedYear === previousValue.year) {
                this.changeItemBackground(this.monthRef[previousValue.month],false)
            }
        }
        this.changeItemBackground(this.monthRef[index], true)
        this.selectedMonth = {
            year: this.yearList[this.state.selectedYear],
            month: index + 1
        }
        onPressItem && onPressItem(index, this.selectedMonth.year, this.selectedMonth.month)
        this.showPicker(false)
    }

    createMonths(year = DateMonth) {
        return Array(12).fill(0).map((item, index) => {
            let month = { 
                month: (index + 1).toString(),
                selected: false,
                disabled: false
            }
            let value = this.selectedMonth? this.selectedMonth: this.props.monthDefault
            if (value) {
                if (value.year === this.yearList[this.state.selectedYear]
                    && value.month === index + 1) {
                        month.selected = true
                }
            }
            if (year <= DateUtil.now().getFullYear()) 
                month.disabled = index < DateUtil.now().getMonth()
            return month
        })
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setEssentialData(nextProps)
    }
}

const styles = {
    itemMonth: {
        borderRadius: 10,
        marginBottom: Constants.MARGIN_LARGE,
        marginLeft: MARGIN_BETWEEN_MONTH,
        backgroundColor: Colors.COLOR_WHITE,
        borderColor: Colors.COLOR_TEXT,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowOffset: {
            height: 8,
            width: 4
        },
        shadowOpacity: 0.25,
    },

    itemYear: {
        flex: 1,
        textAlign: 'center',
    },

    nextButton: {
        padding: Constants.PADDING,
        position: 'absolute',
        margin: Constants.MARGIN
    }
}