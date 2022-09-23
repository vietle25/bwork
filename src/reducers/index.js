import { combineReducers } from 'redux';
import userReducer from 'reducers/userReducer';
import loginReducer from 'reducers/loginReducer';
import signUpReducer from 'reducers/signUpReducer';
import homeReducer from 'reducers/homeReducer';
import { ErrorCode } from 'config/errorCode';
import forgetPassReducer from 'reducers/forgetPassReducer';
import changePassReducer from 'reducers/changePassReducer';
import userProfileReducer from 'reducers/userProfileReducer';
import notificationsReducer from 'reducers/notificationsReducer';
import otpReducer from './otpReducer';
import memberChatReducer from './memberChatReducer';
import editChatReducer from './editChatReducer';
import addressReducer from './addressReducer';
import productDetailReducer from './productDetailReducer';
import autocompleteReducer from './autocompleteReducer';
import listChatReducer from './listChatReducer';
import chatReducer from './chatReducer';
import partnerReducer from './partnerReducer';
import schoolReducer from './schoolReducer';
import salaryHistoryReducer from './salaryHistoryReducer';
import salaryHistoryDetailReducer from './salaryHistoryDetailReducer';
import salaryStaffReducer from './salaryStaffReducer';
import timekeepingHistoryReducer from './timekeepingHistoryReducer';
import timekeepingHistoryDetailReducer from './timekeepingHistoryDetailReducer';
import workingPolicyReducer from './workingPolicyReducer';
import companyDetailReducer from './companyDetailReducer';
import sabbaticalReducer from './sabbaticalReducer';
import registerSabbaticalReducer from './registerSabbaticalReducer';
import departmentReducer from './departmentReducer';
import companyReducer from './companyReducer';
import branchReducer from './branchReducer';
import timekeepingReducer from './timekeepingReducer';
import slidingMenuReducer from './slidingMenuReducer';
import configStaffReducer from './configStaffReducer';
import gifPickerReducer from './gifPickerReducer';
import taskReducer from './taskReducer';
import taskDetailReducer from './taskDetailReducer';

export const initialState = {
    data: null,
    isLoading: false,
    error: null,
    errorCode: ErrorCode.ERROR_INIT,
    action: null
}

export default combineReducers({
    user: userReducer,
    login: loginReducer,
    home: homeReducer,
    signUp: signUpReducer,
    forgetPass: forgetPassReducer,
    changePass: changePassReducer,
    userProfile: userProfileReducer,
    notifications: notificationsReducer,
    otp: otpReducer,
    address: addressReducer,
    productDetailReducer: productDetailReducer,
    autocomplete: autocompleteReducer,
    listChat: listChatReducer,
    chat: chatReducer,
    partner: partnerReducer,
    school: schoolReducer,
    salaryHistory: salaryHistoryReducer,
    salaryDetail: salaryHistoryDetailReducer,
    salaryStaff: salaryStaffReducer,
    timekeepingHistory: timekeepingHistoryReducer,
    timekeepingHistoryDetail: timekeepingHistoryDetailReducer,
    workingPolicy: workingPolicyReducer,
    companyDetail: companyDetailReducer,
    sabbatical: sabbaticalReducer,
    registerSabbatical: registerSabbaticalReducer,
    department: departmentReducer,
    company: companyReducer,
    memberChat: memberChatReducer,
    editChat: editChatReducer,
    branch: branchReducer,
    timekeeping: timekeepingReducer,
    slidingMenu: slidingMenuReducer,
    configStaff: configStaffReducer,
    gifPicker: gifPickerReducer,
    task: taskReducer,
    taskDetail: taskDetailReducer
});

