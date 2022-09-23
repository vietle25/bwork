import { ActionEvent, getActionSuccess } from './actionEvent'


export const login = data => ({ type: ActionEvent.LOGIN, payload: data })

export const loginSuccess = data => ({
    type: getActionSuccess(ActionEvent.LOGIN),
    payload: { data }
});

export const reloadLoginSuccess = () => ({
    type: getActionSuccess(ActionEvent.RELOAD_LOGIN_SUCCESS)
});

export const changePass = (oldPass, newPass, email, forgotPassword) => ({
    type: ActionEvent.CHANGE_PASS, payload: { oldPass, newPass, email, forgotPassword }
})

export const changePassSuccess = data => (
    {
        type: getActionSuccess(ActionEvent.CHANGE_PASS),
        payload: { data }
    }
)

export const forgetPass = (email) => (
    {
        type: ActionEvent.FORGET_PASS,
        payload: { email }
    }
)

export const forgetPassSuccess = data => ({
    type: getActionSuccess(ActionEvent.FORGET_PASS),
    payload: { data }
})

export const getUserProfile = userId => ({ type: ActionEvent.GET_USER_INFO, payload: { userId } })

export const getUserProfileSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_USER_INFO),
    payload: { data }
});

export const editProfile = userModel => ({
    type: ActionEvent.EDIT_PROFILE,
    payload: { ...userModel }
})

export const editProfileSuccess = data => ({ type: getActionSuccess(ActionEvent.EDIT_PROFILE), payload: { data } })

export const signUp = data => ({ type: ActionEvent.SIGN_UP, payload: { ...data } })

export const signUpSuccess = data => ({ type: getActionSuccess(ActionEvent.SIGN_UP), payload: { data } })

export const getReview = reviewFilter => ({
    type: ActionEvent.GET_REVIEW,
    payload: reviewFilter
})

export const getReviewSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_REVIEW),
    payload: { data }
});

export const postReview = content => ({
    type: ActionEvent.POST_REVIEW,
    payload: { content }
})

export const postReviewSuccess = data => ({
    type: getActionSuccess(ActionEvent.POST_REVIEW),
    payload: { data }
})

export const getNotificationsRequest = (filter) => ({
    type: ActionEvent.GET_NOTIFICATIONS,
    filter
})

export const getNotificationsSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_NOTIFICATIONS),
    payload: { data }
})

export const buyPackageRequest = data => ({
    type: ActionEvent.BUY_PACKAGE,
    data
})

export const buyPackageSuccess = data => ({
    type: getActionSuccess(ActionEvent.BUY_PACKAGE),
    payload: { data }
})

export const postNotificationsView = (filterView) => ({
    type: ActionEvent.GET_NOTIFICATIONS_VIEW,
    payload: { ...filterView }
})

export const postNotificationsViewSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_NOTIFICATIONS_VIEW),
    payload: { data }
})

export const logout = () => ({
    type: ActionEvent.LOGOUT
})

export const notifyLoginSuccess = () => ({
    type: ActionEvent.NOTIFY_LOGIN_SUCCESS
})

export const loginGoogle = data => ({
    type: ActionEvent.LOGIN_GOOGLE,
    payload: data
})
export const loginGoogleSuccess = data => ({
    type: getActionSuccess(ActionEvent.LOGIN_GOOGLE),
    payload: { data }
})

export const loginFacebook = data => ({
    type: ActionEvent.LOGIN_FB,
    payload: data
})
export const loginFacebookSuccess = data => ({
    type: getActionSuccess(ActionEvent.LOGIN_FB),
    payload: { data }
})

export const getConfig = filter => ({
    type: ActionEvent.GET_CONFIG,
    payload: { ...filter }
})

export const getConfigSuccess = (data) => ({
    type: getActionSuccess(ActionEvent.GET_CONFIG),
    payload: { data }
})

export const getUpdateVersion = () => ({
    type: ActionEvent.GET_UPDATE_VERSION
})

export const getUpdateVersionSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_UPDATE_VERSION),
    payload: { data }
})

export const sendOTP = filter => ({
    type: ActionEvent.SEND_OTP,
    payload: { ...filter }
})

export const sendOTPSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEND_OTP),
    payload: { data }
})

export const confirmOTP = (filter) => ({
    type: ActionEvent.CONFIRM_OTP,
    filter
})

export const confirmOTPSuccess = data => ({
    type: getActionSuccess(ActionEvent.CONFIRM_OTP),
    payload: { data }
})

export const postUserDeviceInfo = (filter) => ({
    type: ActionEvent.USER_DEVICE_INFO,
    payload: { ...filter }
})

export const postUserDeviceInfoSuccess = data => ({
    type: getActionSuccess(ActionEvent.USER_DEVICE_INFO),
    payload: { data }
})

export const deleteUserDeviceInfo = (filter) => ({
    type: ActionEvent.DELETE_USER_DEVICE_INFO,
    payload: { ...filter }
})

export const deleteUserDeviceInfoSuccess = data => ({
    type: getActionSuccess(ActionEvent.DELETE_USER_DEVICE_INFO),
    payload: { data }
})

export const countNewNotification = () => ({
    type: ActionEvent.COUNT_NEW_NOTIFICATION
})

export const countNewNotificationSuccess = data => ({
    type: getActionSuccess(ActionEvent.COUNT_NEW_NOTIFICATION),
    payload: { data }
})

export const searchNotification = (filter) => ({
    type: ActionEvent.SEARCH_NOTIFICATION,
    payload: { ...filter }
})

export const searchNotificationSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEARCH_NOTIFICATION),
    payload: { data }
})

export const readAllNotification = (filter) => ({
    type: ActionEvent.READ_ALL_NOTIFICATION,
    payload: { ...filter }
})

export const readAllNotificationSuccess = data => ({
    type: getActionSuccess(ActionEvent.READ_ALL_NOTIFICATION),
    payload: { data }
})

export const getNotificationsByType = (filter) => ({
    type: ActionEvent.GET_NOTIFICATIONS_BY_TYPE,
    filter
})

export const getNotificationsByTypeSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_NOTIFICATIONS_BY_TYPE),
    payload: { data }
})

export const saveAddress = filter => ({
    type: ActionEvent.SAVE_ADDRESS,
    payload: { ...filter }
})

export const saveAddressSuccess = data => ({
    type: getActionSuccess(ActionEvent.SAVE_ADDRESS),
    payload: { data }
})

export const onClickMap = data => ({
    type: ActionEvent.PRESS_MAP,
    payload: { ...data }
})

export const searchAddress = (input, key) => ({ type: ActionEvent.SEARCH_ADDRESS, payload: { input, key } })

export const searchAddressSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEARCH_ADDRESS),
    payload: { data }
})

export const getMemberOfConversation = filter => ({
    type: ActionEvent.GET_MEMBER_OF_CONVERSATION,
    payload: { ...filter }
})

export const getMemberOfConversationSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_MEMBER_OF_CONVERSATION),
    payload: { data }
})

export const editChatGroup = filter => ({
    type: ActionEvent.EDIT_CHAT_GROUP,
    payload: { ...filter }
})

export const editChatGroupSuccess = data => ({
    type: getActionSuccess(ActionEvent.EDIT_CHAT_GROUP),
    payload: { data }
})

export const getListConversation = filter => ({
    type: ActionEvent.GET_LIST_CONVERSATION,
    payload: { ...filter }
})

export const getListConversationSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_LIST_CONVERSATION),
    payload: { data }
})

export const createConversation = filter => ({
    type: ActionEvent.CREATE_CONVERSATION,
    payload: { ...filter }
})

export const createConversationSuccess = data => ({
    type: getActionSuccess(ActionEvent.CREATE_CONVERSATION),
    payload: { data }
})

export const getProfileAdmin = userId => ({
    type: ActionEvent.GET_PROFILE_ADMIN,
    payload: { userId }
})

export const getProfileAdminSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_PROFILE_ADMIN),
    payload: { data }
});

export const getListPartner = () => ({
    type: ActionEvent.GET_LIST_PARTNER
})

export const getListPartnerSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_LIST_PARTNER),
    payload: { data }
})

export const savePartner = filter => ({
    type: ActionEvent.SAVE_PARTNER,
    payload: { ...filter }
})

export const savePartnerSuccess = data => ({
    type: getActionSuccess(ActionEvent.SAVE_PARTNER),
    payload: { data }
})

export const deleteConversation = conversationId => ({
    type: ActionEvent.DELETE_CONVERSATION,
    payload: { conversationId }
})

export const deleteConversationSuccess = data => ({
    type: getActionSuccess(ActionEvent.DELETE_CONVERSATION),
    payload: { data }
})

export const searchConversation = filter => ({
    type: ActionEvent.SEARCH_CONVERSATION,
    payload: { ...filter }
})

export const searchConversationSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEARCH_CONVERSATION),
    payload: { data }
})

export const checkExistConversationInHome = filter => ({
    type: ActionEvent.CHECK_EXIST_CONVERSATION_IN_HOME,
    payload: { ...filter }
})

export const checkExistConversationInHomeSuccess = data => ({
    type: getActionSuccess(ActionEvent.CHECK_EXIST_CONVERSATION_IN_HOME),
    payload: { data }
})

export const checkExistConversation = filter => ({
    type: ActionEvent.CHECK_EXIST_CONVERSATION,
    payload: { ...filter }
})

export const getFriendsChatView = filter => ({
    type: ActionEvent.GET_FRIENDS_CHAT_VIEW,
    payload: { ...filter }
})

export const getFriendsChatViewSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_FRIENDS_CHAT_VIEW),
    payload: { data }
})

export const getMemberGroupChatView = filter => ({
    type: ActionEvent.GET_MEMBER_GROUP_CHAT_VIEW,
    payload: { ...filter }
})

export const getMemberGroupChatViewSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_MEMBER_GROUP_CHAT_VIEW),
    payload: { data }
})

export const checkExistConversationSuccess = data => ({
    type: getActionSuccess(ActionEvent.CHECK_EXIST_CONVERSATION),
    payload: { data }
})

export const checkConversationActive = () => ({
    type: ActionEvent.CHECK_CONVERSATION_ACTIVE,
})

export const checkConversationActiveSuccess = data => ({
    type: getActionSuccess(ActionEvent.CHECK_CONVERSATION_ACTIVE),
    payload: { data }
})

export const getProfileUserChat = userId => ({
    type: ActionEvent.GET_PROFILE_USER_CHAT,
    payload: { userId }
})

export const getProfileUserChatSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_PROFILE_USER_CHAT),
    payload: { data }
});

export const getSchools = filter => ({
    type: ActionEvent.GET_SCHOOLS,
    payload: { ...filter }
})

export const getSchoolsSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SCHOOLS),
    payload: { data }
});

export const getFeedbackMedicalExamination = filter => ({
    type: ActionEvent.GET_FEEDBACK_MEDICAL_EXAMINATION,
    payload: { ...filter }
})

export const getFeedbackMedicalExaminationSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_FEEDBACK_MEDICAL_EXAMINATION),
    payload: { data }
});

export const getFirebaseToken = () => ({
    type: ActionEvent.GET_FIREBASE_TOKEN
})

export const getFirebaseTokenSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_FIREBASE_TOKEN),
    payload: { data }
})

export const getCompanyDetail = (companyId) => ({
    type: ActionEvent.GET_COMPANY_DETAIL,
    payload: { companyId }
})

export const getCompanyDetailSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_COMPANY_DETAIL),
    payload: { data }
});

export const getListDepartment = (filter) => ({
    type: ActionEvent.GET_LIST_DEPARTMENT,
    payload: { ...filter }
})

export const getListDepartmentSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_LIST_DEPARTMENT),
    payload: { data }
});

export const updateDepartment = (filter) => ({
    type: ActionEvent.UPDATE_DEPARTMENT,
    payload: { ...filter }
})

export const updateDepartmentSuccess = data => ({
    type: getActionSuccess(ActionEvent.UPDATE_DEPARTMENT),
    payload: { data }
});

export const getCompanies = (filter) => ({
    type: ActionEvent.GET_COMPANIES,
    payload: { ...filter }
})

export const getCompaniesSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_COMPANIES),
    payload: { data }
});

export const getBranches = (filter) => ({
    type: ActionEvent.GET_BRANCHES,
    payload: { ...filter }
})

export const getBranchesSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_BRANCHES),
    payload: { data }
});

export const deniedStaff = (filter) => ({
    type: ActionEvent.DENIED_STAFF,
    payload: { ...filter }
})

export const deniedStaffSuccess = data => ({
    type: getActionSuccess(ActionEvent.DENIED_STAFF),
    payload: { data }
})

export const configStaff = (filter) => ({
    type: ActionEvent.CONFIG_STAFF,
    payload: { ...filter }
})

export const configStaffSuccess = data => ({
    type: getActionSuccess(ActionEvent.CONFIG_STAFF),
    payload: { data }
});
