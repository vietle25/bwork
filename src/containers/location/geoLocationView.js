
import React, { Component } from "react";
import {
    View,
    Platform,
    PermissionsAndroid
} from "react-native";
import BaseView from "containers/base/baseView";
import StorageUtil from "utils/storageUtil";
import Utils from "utils/utils";
import Geolocation from 'react-native-geolocation-service';

export default class GeoLocationView extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            latitude: null,
            longitude: null,
            error: null
        };
        this.TIMEOUT_START_POSITION = 60000 * 5 //5p
        this.TIMEOUT_CURRENT_POSITION = 20000 //20s
        this.TIMEOUT_CACHE_OLD_POSITION = 10000 //10s
        this.DISTANCE_LOCATION = 30 //Distance value return location(m)
    }

    /**
     * Get geo location
     */
    getGeoLocation = async () => {
        await this.getLocationUpdates();
        await setInterval(() => {
            this.getLocation();
        }, this.TIMEOUT_START_POSITION)
    }

    /**
     * Get location
     */
    getLocation = async () => {
        const hasLocationPermission = await this.hasPermission(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

        if (!hasLocationPermission) return;

        Geolocation.getCurrentPosition(
            (position) => {
                this.state.latitude = position.coords.latitude;
                this.state.longitude = position.coords.longitude;
                this.resultPosition();
                // console.log("Get Current Position", position)
            },
            (error) => {
                this.setState({ error: error.message });
                console.log(error);
            },
            {
                enableHighAccuracy: true,
                timeout: this.TIMEOUT_CURRENT_POSITION,
                maximumAge: this.TIMEOUT_CACHE_OLD_POSITION,
                distanceFilter: this.DISTANCE_LOCATION,
                forceRequestLocation: true
            }
        );
    }

    /**
     * Get location updates
     */
    getLocationUpdates = async () => {
        const hasLocationPermission = await this.hasPermission(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

        if (!hasLocationPermission) return;

        this.watchId = Geolocation.watchPosition(
            (position) => {
                this.state.latitude = position.coords.latitude;
                this.state.longitude = position.coords.longitude;
                this.resultPosition();
                // console.log("Watch Position", position)
            },
            (error) => {
                this.setState({ error: error.message });
                console.log(error);
            },
            {
                enableHighAccuracy: true,
                distanceFilter: 0,
                interval: 5000,
                fastestInterval: 2000
            }
        );
    }

    /**
     * Result position
     */
    resultPosition() {

    }

    /**
     * Remove location updates
     */
    removeLocationUpdates = () => {
        if (this.watchId !== null) {
            Geolocation.clearWatch(this.watchId);
        }
    }

    componentWillMount() {
        super.componentWillMount();
    }

    async componentDidMount() {
        super.componentDidMount();
        this.getGeoLocation();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.removeLocationUpdates();
    }

    render() {
        return (<View></View>)
    }

}