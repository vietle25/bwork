
import AsyncStorage from '@react-native-community/async-storage';

export default class StorageUtil {

    static USER_PROFILE = "userProfile";
    static USER_TOKEN = "userToken"; //Save user token
    static MOBILE_CONFIG = "mobileConfig";
    static FCM_TOKEN = "fcmToken";
    static VERSION = 'versionApp';
    static OTP_KEY = 'otpKey';
    static FIREBASE_TOKEN = 'firebaseToken';
    static ALARM = 'alarm';
    static NOTIFICATION_ID = 'notificationId';
    static COMPANY_INFO = 'companyInfo';

    /**
     * Store data
     * @param {*} key 
     * @param {*} item 
     */
    static async storeItem(key, item) {
        try {
            //we want to wait for the Promise returned by AsyncStorage.setItem()
            //to be resolved to the actual value before returning the value
            var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
            console.log(jsonOfItem);
            return jsonOfItem;
        } catch (error) {
            console.log(error.message);
        }
    }

    /**
     * Delete item with key
     * @param {*} key 
     */
    static async deleteItem(key) {
        try {
            var deleteItem = await AsyncStorage.removeItem(key);
            return deleteItem;
        } catch (error) {
            console(error.message)
        }
    }

    /**
     * Retry data
     * @param {*} key 
     */
    static async retrieveItem(key) {
        try {
            const retrievedItem = await AsyncStorage.getItem(key);
            const item = JSON.parse(retrievedItem);
            return item;
        } catch (error) {
            console.log(error.message);
        }
        return
    }

    /**
     * Store item type is json
     * @param {*} key 
     * @param {*} item 
     */
    static async storeItemJson(key, item) {
        try {
            //we want to wait for the Promise returned by AsyncStorage.setItem()
            //to be resolved to the actual value before returning the value
            var jsonOfItem = await AsyncStorage.setItem(key, item);
            return jsonOfItem;
        } catch (error) {
            console.log(error.message);
        }
    }
}
