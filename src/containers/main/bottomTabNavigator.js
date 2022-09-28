import { createBottomTabNavigator } from "react-navigation";

// Import screens
import HomeView from "containers/home/homeView";
import TaskManagerView from "containers/task/taskManagerView";
import TimekeepingHistoryView from "containers/timekeeping/history/timekeepingHistoryView";
import UserProfileView from "containers/user/profile/info/userProfileView";

// import icons
import BottomTabCustom from "components/bottomTabCustom";
import SabbaticalView from "containers/sabbatical/sabbaticalView";
import { Colors } from "values/colors";
import HomeButton from "./tabIcon/homeButton";
import ProfileButton from "./tabIcon/profileButton";
import SabbaticalButton from "./tabIcon/sabbaticalButton";
import TaskButton from "./tabIcon/taskButton";
import TimekeepingHistoryButton from "./tabIcon/timekeepingHistoryButton";

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
