import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TabBarCustom from 'components/tabBarCustom';

// Import screens
import HomeView from 'containers/home/homeView';
// import icons
import sabbaticalView from 'containers/sabbatical/sabbaticalView';
import taskManagerView from 'containers/task/taskManagerView';
import timekeepingHistoryView from 'containers/timekeeping/history/timekeepingHistoryView';
import userProfileView from 'containers/user/profile/info/userProfileView';
import ic_calendar_grey from 'images/ic_calendar_grey.png';
import ic_edit_task_black from 'images/ic_edit_task_black.png';
import ic_history_timekeeping_black from 'images/ic_history_timekeeping_black.png';
import ic_task_black from 'images/ic_task_black.png';
import ic_user_black from 'images/ic_user_black.png';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = props => {
    return (
        <Tab.Navigator
            initialRouteName={'HomeView'}
            backBehavior={'initialRoute'}
            lazy={true}
            tabBar={props => <TabBarCustom {...props} />}>
            <Tab.Screen
                name="HomeView"
                component={HomeView}
                options={{
                    title: 'Chấm công',
                    icon: ic_task_black,
                    iconActive: ic_task_black,
                }}
            />
            <Tab.Screen
                name="SabbaticalView"
                component={sabbaticalView}
                options={{
                    title: 'Xin phép',
                    icon: ic_history_timekeeping_black,
                    iconActive: ic_history_timekeeping_black,
                }}
            />
            <Tab.Screen
                name="TaskManagerView"
                component={taskManagerView}
                options={{
                    title: 'Công việc',
                    icon: ic_edit_task_black,
                    iconActive: ic_edit_task_black,
                }}
            />
            <Tab.Screen
                name="TimekeepingHistoryView"
                component={timekeepingHistoryView}
                options={{
                    title: 'Lịch sử',
                    icon: ic_calendar_grey,
                    iconActive: ic_calendar_grey,
                }}
            />
            <Tab.Screen
                name="UserProfileView"
                component={userProfileView}
                options={{
                    title: 'Tài khoản',
                    icon: ic_user_black,
                    iconActive: ic_user_black,
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
