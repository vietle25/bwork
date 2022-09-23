import React, { Component } from "react";
import {
	BackHandler,
	Text,
	View,
	Image,
	Alert,
	Dimensions
} from "react-native";
import { createBottomTabNavigator } from "react-navigation";

// Import screens
import NotificationView from "containers/user/notification/notificationView";
import UserProfileView from "containers/user/profile/info/userProfileView";
import TimekeepingHistoryView from "containers/timekeeping/history/timekeepingHistoryView";
import HomeView from "containers/home/homeView";
import ListChatView from "containers/chat/list/listChatView";
import TaskManagerView from "containers/task/taskManagerView";

// import icons
import { Colors } from "values/colors";
import { Fonts } from "values/fonts";
import commonStyles from "styles/commonStyles";
import { Constants } from "values/constants";
import HomeButton from "./tabIcon/homeButton";
import TimekeepingHistoryButton from "./tabIcon/timekeepingHistoryButton";
import NotificationButton from "./tabIcon/notificationButton";
import ChatButton from "./tabIcon/chatButton";
import ProfileButton from "./tabIcon/profileButton";
import SabbaticalView from "containers/sabbatical/sabbaticalView";
import SabbaticalButton from "./tabIcon/sabbaticalButton";
import TaskButton from "./tabIcon/taskButton";
import BottomTabCustom from "components/bottomTabCustom";

const RouteConfig = {
	Home: {
		screen: HomeView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<HomeButton focused={focused} navigation={navigation} />
			)
		})
	},
	Sabbatical: {
		screen: SabbaticalView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<SabbaticalButton focused={focused} navigation={navigation} />
			)
		})
	},
	Task: {
		screen: TaskManagerView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<TaskButton focused={focused} navigation={navigation} />
			)
		})
	},
	TimekeepingHistory: {
		screen: TimekeepingHistoryView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<TimekeepingHistoryButton focused={focused} navigation={navigation} />
			)
		})
	},
	// ListChat: {
	// 	screen: ListChatView,
	// 	navigationOptions: ({ navigation }) => ({
	// 		tabBarIcon: ({ focused, tintColor }) => (
	// 			<ChatButton focused={focused} navigation={navigation} />
	// 		)
	// 	})
	// },
	Profile: {
		screen: UserProfileView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<ProfileButton focused={focused} navigation={navigation} />
			)
		})
	}
};

const BottomNavigatorConfig = {
	tabBarComponent: props => <BottomTabCustom {...props} />,
	tabBarOptions: {
		style: {
			backgroundColor: Colors.COLOR_WHITE,
		},
		showLabel: false,
		keyboardHidesTabBar: true
	}
};

export default createBottomTabNavigator(RouteConfig, BottomNavigatorConfig);
