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
import SlidingMenuAdminView from "containers/user/profile/info/sliding/slidingMenuAdminView";
import HomeAdminView from "containers/home/homeAdminView";
import TimekeepingAdminView from "containers/timekeeping/timekeepingAdminView";
import SabbaticalAdminView from "containers/sabbatical/admin/sabbaticalAdminView";

// import icons
import { Colors } from "values/colors";
import { Fonts } from "values/fonts";
import commonStyles from "styles/commonStyles";
import { Constants } from "values/constants";
import HomeButton from "./tabIconAdmin/homeButton";
import TimekeepingAdminButton from "./tabIconAdmin/timekeepingAdminButton";
import ListStaffSalaryButton from "./tabIconAdmin/listStaffSalaryButton";
import ProfileAdminButton from "./tabIconAdmin/profileAdminButton";
import SabbaticalAdminButton from "./tabIconAdmin/sabbaticalAdminButton";
import BottomTabCustom from "components/bottomTabCustom";
import ListStaffSalaryView from "containers/salary/admin/listStaffSalaryView";

const RouteConfig = {
	HomeAdmin: {
		screen: HomeAdminView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<HomeButton focused={focused} navigation={navigation} />
			)
		})
	},
	TimekeepingAdmin: {
		screen: TimekeepingAdminView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<TimekeepingAdminButton focused={focused} navigation={navigation} />
			)
		})
	},
	SabbaticalAdmin: {
		params: { screenType: null },
		screen: SabbaticalAdminView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<SabbaticalAdminButton focused={focused} navigation={navigation} />
			)
		})
	},
	ListStaffSalary: {
		params: { a: true },
		screen: ListStaffSalaryView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<ListStaffSalaryButton focused={focused} navigation={navigation} />
			)
		})
	},
	ProfileAdmin: {
		screen: SlidingMenuAdminView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<ProfileAdminButton focused={focused} navigation={navigation} />
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
