import LoginView from 'containers/user/login/loginView';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import companyListView from 'containers/company/companyListView';
import configStaffView from 'containers/configStaff/configStaffView';
import companyDetailView from 'containers/home/company/companyDetailView';
import Main from 'containers/main/bottomTabNavigator';
import MapCustomView from 'containers/map/mapCustomView';
import registerSabbaticalView from 'containers/sabbatical/register/registerSabbaticalView';
import salaryHistoryDetailView from 'containers/salary/detail/salaryHistoryDetailView';
import salaryHistoryView from 'containers/salary/history/salaryHistoryView';
import SplashView from 'containers/splash/splashView';
import taskDetailView from 'containers/task/details/taskDetailView';
import taskManagerView from 'containers/task/taskManagerView';
import timekeepingHistoryDetailView from 'containers/timekeeping/history/detail/timekeepingHistoryDetailView';
import timekeepingHistoryView from 'containers/timekeeping/history/timekeepingHistoryView';
import changePasswordView from 'containers/user/changePassword/changePasswordView';
import confirmPasswordView from 'containers/user/forgotPassword/confirmPassword/confirmPasswordView';
import forgotPasswordView from 'containers/user/forgotPassword/forgotPasswordView';
import notificationView from 'containers/user/notification/notificationView';
import otpView from 'containers/user/otp/otpView';
import userInfoView from 'containers/user/profile/info/userInfoView';
import SettingAlarmView from 'containers/user/profile/setting/settingAlarmView';
import departmentView from 'containers/user/register/department/departmentView';
import registerView from 'containers/user/register/registerView';
import {Platform} from 'react-native';
import {enableScreens} from 'react-native-screens';
enableScreens();

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={'Splash'}
                headerMode={'none'}
                // mode={'modal'}
                screenOptions={{
                    useNativeDriver: true,
                    gestureEnabled: Platform.OS === 'ios',
                    cardOverlayEnabled: true,
                    ...TransitionPresets.SlideFromRightIOS,
                }}>
                <Stack.Screen name="Splash" component={SplashView} />
                <Stack.Screen name="Login" component={LoginView} />
                <Stack.Screen name="Register" component={registerView} />
                <Stack.Screen name="Main" component={Main} />
                <Stack.Screen name="Notification" component={notificationView} />
                <Stack.Screen name="ChangePassword" component={changePasswordView} />
                <Stack.Screen name="ForgotPassword" component={forgotPasswordView} />
                <Stack.Screen name="ConfirmPassword" component={confirmPasswordView} />
                <Stack.Screen name="OTP" component={otpView} />
                <Stack.Screen name="UserInfo" component={userInfoView} />
                <Stack.Screen name="SalaryHistory" component={salaryHistoryView} />
                <Stack.Screen name="SalaryHistoryDetail" component={salaryHistoryDetailView} />
                <Stack.Screen name="TimekeepingHistory" component={timekeepingHistoryView} />
                <Stack.Screen name="TimekeepingHistoryDetail" component={timekeepingHistoryDetailView} />
                <Stack.Screen name="SettingAlarm" component={SettingAlarmView} />
                <Stack.Screen name="CompanyDetail" component={companyDetailView} />
                <Stack.Screen name="RegisterSabbatical" component={registerSabbaticalView} />
                <Stack.Screen name="Department" component={departmentView} />
                {/* <Stack.Screen name="DepartmentList" component={ListDepartmentView} /> */}
                {/* <Stack.Screen name="StaffDepartmentList" component={ListStaffDepartmentView} /> */}
                <Stack.Screen name="CompanyList" component={companyListView} />
                <Stack.Screen name="ConfigStaff" component={configStaffView} />
                <Stack.Screen name="TaskManager" component={taskManagerView} />
                <Stack.Screen name="TaskDetail" component={taskDetailView} />
                <Stack.Screen name="Map" component={MapCustomView} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
