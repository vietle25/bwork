import React, { Component } from 'react';
import { View, Text } from 'react-native';

class IconBadge extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { valueBadge } = this.props
        return (
            { valueBadge } != 0 ? <View
            style={{
                position: 'absolute',
                right: 10,
                top: 5,
                backgroundColor: 'red',
                borderRadius: 9,
                width: 18,
                height: 18,
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Text style={{ color: 'white' }}>{valueBadge}</Text>
        </View> : <View></View>
        );
    }
}

export default IconBadge
