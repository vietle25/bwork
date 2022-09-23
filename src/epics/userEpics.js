import { ActionEvent } from 'actions/actionEvent'
import { Observable } from 'rxjs';
import {
    map,
    filter,
    catchError,
    mergeMap
} from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { delay, mapTo, switchMap } from 'rxjs/operators';
import { dispatch } from 'rxjs/internal/observable/range';
import * as userActions from 'actions/userActions';
import { ServerPath } from 'config/Server';
import { Header, handleErrors, consoleLogEpic, handleConnectErrors } from './commonEpic';
import { ErrorCode } from 'config/errorCode';
import { fetchError } from 'actions/commonActions';
import ApiUtil from 'utils/apiUtil';

/**
 * Login
 * @param {*} action$ 
 */
export const loginEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.LOGIN),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/log-me-in', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                if (responseJson.errorCode == ErrorCode.LOGIN_FAIL_USERNAME_PASSWORD_MISMATCH) {
                    // this.showMessage('Tài khoản hoặc mật khẩu không đúng')
                }
                return userActions.loginSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("LOGIN USER_EPIC:", ActionEvent.LOGIN, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const loginGoogleEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.LOGIN_GOOGLE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/log-me-in/google', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log('google: ', responseJson);
                if (responseJson.errorCode == ErrorCode.LOGIN_FAIL_USERNAME_PASSWORD_MISMATCH) {
                    // this.showMessage('Tài khoản hoặc mật khẩu không đúng')
                }
                return userActions.loginGoogleSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("LOGIN_GOOGLE USER_EPIC:", ActionEvent.LOGIN_GOOGLE, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const loginFacebookEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.LOGIN_FB),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/log-me-in/facebook', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log('facebook: ', responseJson);
                if (responseJson.errorCode == ErrorCode.LOGIN_FAIL_USERNAME_PASSWORD_MISMATCH) {
                    // this.showMessage('Tài khoản hoặc mật khẩu không đúng')
                }
                return userActions.loginFacebookSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("LOGIN_FB USER_EPIC:", ActionEvent.LOGIN_FB, error);
                    return handleConnectErrors(error)
                })
        )
    );
export const registerEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.REGISTER),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'register', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.loginSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("REGISTER USER_EPIC:", ActionEvent.REGISTER, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const changePassEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CHANGE_PASS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/password/change', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.changePassSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("CHANGE_PASS USER_EPIC:", ActionEvent.CHANGE_PASS, error);
                    return handleConnectErrors(error);
                })
        )
    );

export const getUserInfoEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_USER_INFO),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/${action.payload.userId}/profile`, {
                method: 'GET',
                //headers:Header
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getUserProfileSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_USER_INFO USER_EPIC:", ActionEvent.GET_USER_INFO, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const editProfileEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.EDIT_PROFILE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/edit', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.editProfileSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("EDIT_PROFILE USER_EPIC:", ActionEvent.EDIT_PROFILE, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const signUp = action$ =>
    action$.pipe(
        ofType(ActionEvent.SIGN_UP),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/signup', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.signUpSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("SIGN_UP USER_EPIC:", ActionEvent.SIGN_UP, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const forgetPassEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.FORGET_PASS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/forget-password', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.forgetPassSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("FORGET_PASS USER_EPIC:", ActionEvent.FORGET_PASS, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getReviewEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_REVIEW),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'review/1/10/list', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.getReviewSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_REVIEW USER_EPIC:", ActionEvent.GET_REVIEW, error);
                    return handleConnectErrors(error)
                })
        )
    )
export const postReviewEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.POST_REVIEW),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'review/1/10', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.postReviewSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("POST_REVIEW USER_EPIC:", ActionEvent.POST_REVIEW, error);
                    return handleConnectErrors(error)
                })
        )
    )

export const getNotificationsEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_NOTIFICATIONS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/notification', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.getNotificationsSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("GET_NOTIFICATIONS USER_EPIC:", ActionEvent.GET_NOTIFICATIONS, error);
                return handleConnectErrors(error)
            })
        )
    )

export const getNotificationsByTypeEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_NOTIFICATIONS_BY_TYPE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/notification', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("GET_NOTIFICATIONS_BY_TYPE: ", responseJson)
                return userActions.getNotificationsByTypeSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("GET_NOTIFICATIONS_BY_TYPE USER_EPIC:", ActionEvent.GET_NOTIFICATIONS_BY_TYPE, error);
                return handleConnectErrors(error)
            })
        )
    )

export const getNotificationsViewEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_NOTIFICATIONS_VIEW),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/notification/view', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.postNotificationsViewSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_NOTIFICATIONS_VIEW VIEW USER_EPIC:", ActionEvent.GET_NOTIFICATIONS_VIEW, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getConfigEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_CONFIG),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/m/config', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getConfigSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_CONFIG USER_EPIC:", ActionEvent.GET_CONFIG, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const sendOTPEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEND_OTP),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/send-otp', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson.data)
                return userActions.sendOTPSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("SEND_OTP USER_EPIC:", ActionEvent.SEND_OTP, error);
                return handleConnectErrors(error)
            })
        )
    );

export const confirmOTPEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CONFIRM_OTP),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/confirm-otp', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.confirmOTPSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("CONFIRM_OTP USER_EPIC:", ActionEvent.CONFIRM_OTP, error);
                return handleConnectErrors(error)
            })
        )
    );

export const postUserDeviceInfoEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.USER_DEVICE_INFO),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/device', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.postUserDeviceInfoSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("USER_DEVICE_INFO USER_EPIC:", ActionEvent.USER_DEVICE_INFO, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const deleteUserDeviceInfoEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.DELETE_USER_DEVICE_INFO),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/delete/device', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.deleteUserDeviceInfoSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("DELETE_USER_DEVICE_INFO USER_EPIC:", ActionEvent.DELETE_USER_DEVICE_INFO, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const countNewNotificationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.COUNT_NEW_NOTIFICATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/count/new/notification', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("COUNT NEW NOTIFICATION JSON", responseJson);
                global.badgeCount = responseJson.data
                return userActions.countNewNotificationSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("COUNT_NEW_NOTIFICATION USER_EPIC:", ActionEvent.COUNT_NEW_NOTIFICATION, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const searchNotificationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEARCH_NOTIFICATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/search/notification', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("SEARCH_NOTIFICATION JSON", responseJson);
                return userActions.searchNotificationSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("SEARCH_NOTIFICATION USER_EPIC:", ActionEvent.SEARCH_NOTIFICATION, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const readAllNotificationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.READ_ALL_NOTIFICATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/view/notification/all', {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("READ_ALL_NOTIFICATION JSON", responseJson);
                return userActions.readAllNotificationSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("READ_ALL_NOTIFICATION USER_EPIC:", ActionEvent.READ_ALL_NOTIFICATION, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const saveAddressEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SAVE_ADDRESS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/address', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("JSON", responseJson);
                return userActions.saveAddressSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("SAVE_ADDRESS USER_EPIC:", ActionEvent.SAVE_ADDRESS, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const searchAddressEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEARCH_ADDRESS),
        switchMap((action) =>
            fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${action.payload.input}&language=vi&key=${action.payload.key}`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("JSON", responseJson);
                return userActions.searchAddressSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("SEARCH_ADDRESS USER_EPIC:", ActionEvent.SEARCH_ADDRESS, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getMemberOfConversationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_MEMBER_OF_CONVERSATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/chat/list`, {
                // old : user/member/conversation
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.getMemberOfConversationSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_MEMBER_OF_CONVERSATION:", ActionEvent.GET_MEMBER_OF_CONVERSATION, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getListConversationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_LIST_CONVERSATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/list/conversation`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.getListConversationSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_LIST_CONVERSATION USER_EPICS", ActionEvent.GET_LIST_CONVERSATION, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getFriendsChatViewEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_FRIENDS_CHAT_VIEW),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/chat/list`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.getFriendsChatViewSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_FRIENDS_CHAT_VIEW USER_EPIC:", ActionEvent.GET_FRIENDS_CHAT_VIEW, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getMemberGroupChatViewEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_MEMBER_GROUP_CHAT_VIEW),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/chat/list`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.getMemberGroupChatViewSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_MEMBER_GROUP_CHAT_VIEW USER_EPIC:", ActionEvent.GET_MEMBER_GROUP_CHAT_VIEW, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const createConversationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CREATE_CONVERSATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/create`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.createConversationSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("CREATE_CONVERSATION:", ActionEvent.CREATE_CONVERSATION, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getProfileAdminEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_PROFILE_ADMIN),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/${action.payload.userId}/profile`, {
                method: 'GET',
                //headers:Header
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getProfileAdminSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_PROFILE_ADMIN USER_EPIC:", ActionEvent.GET_PROFILE_ADMIN, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getListPartnerEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_LIST_PARTNER),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/list/partner`, {
                method: 'GET',
                //headers:Header
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getListPartnerSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_LIST_PARTNER USER_EPIC:", ActionEvent.GET_LIST_PARTNER, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const savePartnerEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SAVE_PARTNER),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/save/partner`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.savePartnerSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("SAVE_PARTNER:", ActionEvent.SAVE_PARTNER, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const deleteConversationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.DELETE_CONVERSATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/${action.payload.conversationId}/delete`, {
                method: 'GET',
                //headers:Header
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.deleteConversationSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("DELETE_CONVERSATION USER_EPIC:", ActionEvent.DELETE_CONVERSATION, error);
                return handleConnectErrors(error)
            })
        )
    );

export const editChatGroupEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.EDIT_CHAT_GROUP),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/${action.payload.conversationId}/edit`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.editChatGroupSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("EDIT_CONVERSATION USER_EPIC:", ActionEvent.EDIT_CHAT_GROUP, error);
                return handleConnectErrors(error)
            })
        )
    );

export const searchConversationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEARCH_CONVERSATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/search`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.searchConversationSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("SEARCH_CONVERSATION USER_EPIC:", ActionEvent.SEARCH_CONVERSATION, error);
                return handleConnectErrors(error)
            })
        )
    );

export const checkExistConversationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CHECK_EXIST_CONVERSATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/check`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.checkExistConversationSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("CHECK_EXIST_CONVERSATION USER_EPIC:", ActionEvent.CHECK_EXIST_CONVERSATION, error);
                return handleConnectErrors(error)
            })
        )
    );

export const checkExistConversationInHomeEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CHECK_EXIST_CONVERSATION_IN_HOME),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/check`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.checkExistConversationInHomeSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("CHECK_EXIST_CONVERSATION_IN_HOME USER_EPIC:", ActionEvent.CHECK_EXIST_CONVERSATION_IN_HOME, error);
                return handleConnectErrors(error)
            })
        )
    );

export const checkConversationActiveEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CHECK_CONVERSATION_ACTIVE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/active/check`, {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.checkConversationActiveSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("CHECK_CONVERSATION_ACTIVE USER_EPIC:", ActionEvent.CHECK_CONVERSATION_ACTIVE, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getProfileUserChatEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_PROFILE_USER_CHAT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/${action.payload.userId}/profile`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getProfileUserChatSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_PROFILE_USER_CHAT USER_EPIC:", ActionEvent.GET_PROFILE_USER_CHAT, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getSchoolsEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_SCHOOLS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/schools`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getSchoolsSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_SCHOOLS USER_EPIC:", ActionEvent.GET_SCHOOLS, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getFeedbackMedicalExaminationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_FEEDBACK_MEDICAL_EXAMINATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/feedback/medical/examination`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getFeedbackMedicalExaminationSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("getFeedbackMedicalExamination USER_EPIC:", ActionEvent.GET_FEEDBACK_MEDICAL_EXAMINATION, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getFirebaseTokenEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_FIREBASE_TOKEN),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/firebase/token', {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getFirebaseTokenSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_FIREBASE_TOKEN USER_EPIC:", ActionEvent.GET_FIREBASE_TOKEN, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getCompanyDetailEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_COMPANY_DETAIL),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/company/${action.payload.companyId}/detail`, {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getCompanyDetailSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_COMPANY_DETAIL USER_EPIC:", ActionEvent.GET_COMPANY_DETAIL, error);
                return handleConnectErrors(error)
            })
        )
    );

export const updateDepartmentEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.UPDATE_DEPARTMENT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/department/update/`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.updateDepartmentSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("UPDATE_DEPARTMENT USER_EPIC:", ActionEvent.UPDATE_DEPARTMENT, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getListDepartmentEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_LIST_DEPARTMENT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `department/list`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getListDepartmentSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_LIST_DEPARTMENT USER_EPIC:", ActionEvent.GET_LIST_DEPARTMENT, error);
                return handleConnectErrors(error)
            })
        )
    );


export const getCompaniesEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_COMPANIES),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/company/get/`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getCompaniesSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_COMPANIES USER_EPIC:", ActionEvent.GET_COMPANIES, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getBranchesEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_BRANCHES),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/company/${action.payload.companyId}/branch/get/`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getBranchesSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_BRANCHES USER_EPIC:", ActionEvent.GET_BRANCHES, error);
                return handleConnectErrors(error)
            })
        )
    );

export const deniedStaffEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.DENIED_STAFF),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/${action.payload.userId}/denied`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.deniedStaffSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("DENIED_STAFF USER EPIC:", ActionEvent.DENIED_STAFF, error)
                return handleConnectErrors(error)
            })
        )
    );

export const configStaffEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CONFIG_STAFF),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/config/staff/${action.payload.staffId}/`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.configStaffSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("CONFIG_STAFF USER_EPIC:", ActionEvent.CONFIG_STAFF, error);
                return handleConnectErrors(error)
            })
        )
    );