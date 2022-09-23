import { AppRegistry } from 'react-native';
import App from './App';
import { Platform } from "react-native";
import bgMessaging from './bgMessaging';

AppRegistry.registerComponent(Platform.OS  === 'android' ? 'timekeeping' : 'ielts', () => App);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);
