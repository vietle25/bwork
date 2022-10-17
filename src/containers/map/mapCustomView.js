import BaseView from 'containers/base/baseView';
import {HStack} from 'native-base';
import {PermissionsAndroid, SafeAreaView, View} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, {Marker} from 'react-native-maps';
import commonStyles from 'styles/commonStyles';
import {Colors} from 'values/colors';
import styles from './styles';

class MapCustomView extends BaseView {
    constructor(props) {
        super(props);
        const {route} = this.props;
        this.state = {
            latitude: route.params ? route.params.latitude : '',
            longitude: route.params ? route.params.longitude : '',
            error: null,
        };
    }

    componentDidMount() {
        super.componentDidMount();
        // this.getGeoLocation();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        // this.removeLocationUpdates();
    }

    getGeoLocation = async () => {};

    /**
     * Get location
     */
    getLocation = async () => {
        const hasLocationPermission = await this.hasPermission(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

        if (!hasLocationPermission) return;

        Geolocation.getCurrentPosition(
            position => {
                this.state.latitude = position.coords.latitude;
                this.state.longitude = position.coords.longitude;
                this.resultPosition();
                // console.log("Get Current Position", position)
            },
            error => {
                this.setState({error: error.message});
                console.log(error);
            },
            {
                enableHighAccuracy: true,
                timeout: this.TIMEOUT_CURRENT_POSITION,
                maximumAge: this.TIMEOUT_CACHE_OLD_POSITION,
                distanceFilter: this.DISTANCE_LOCATION,
                forceRequestLocation: true,
            },
        );
    };

    /**
     * Get location updates
     */
    getLocationUpdates = async () => {
        const hasLocationPermission = await this.hasPermission(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

        if (!hasLocationPermission) return;

        this.watchId = Geolocation.watchPosition(
            position => {
                this.state.latitude = position.coords.latitude;
                this.state.longitude = position.coords.longitude;
                this.resultPosition();
                // console.log("Watch Position", position)
            },
            error => {
                this.setState({error: error.message});
                console.log(error);
            },
            {
                enableHighAccuracy: true,
                distanceFilter: 0,
                interval: 5000,
                fastestInterval: 2000,
            },
        );
    };

    /**
     * Result position
     */
    resultPosition() {}

    /**
     * Remove location updates
     */
    removeLocationUpdates = () => {
        if (this.watchId !== null) {
            Geolocation.clearWatch(this.watchId);
        }
    };

    render() {
        const {latitude, longitude} = this.state;
        return (
            <SafeAreaView style={styles.container}>
                <HStack style={[commonStyles.header]}>
                    {this.renderHeaderView({
                        title: 'Vị trí chấm công',
                        titleStyle: {color: Colors.COLOR_WHITE},
                    })}
                </HStack>
                <View style={{flex: 1}}>
                    <MapView
                        style={{flex: 1}}
                        initialRegion={{
                            latitude: latitude,
                            longitude: longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}>
                        <Marker coordinate={{latitude: latitude, longitude: longitude}} title={'Vị trí chấm công'} />
                    </MapView>
                </View>
            </SafeAreaView>
        );
    }
}
export default MapCustomView;
