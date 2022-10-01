import background_top_view from "images/background_top_view.png";
import { Component } from 'react';
import {
    Dimensions,
    ImageBackground
} from 'react-native';
import Utils from 'utils/utils';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';

const window = Dimensions.get('window');

class BackgroundTopView extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let ratio = !Utils.isNull(this.props.ratio) ? this.props.ratio : 3
        return (
            <ImageBackground
                resizeMode='cover'
                style={{ width: window.width, height: window.height / ratio + Constants.POSITION_TOP_VIEW, backgroundColor: Colors.COLOR_PRIMARY }}
                source={background_top_view} />
        );
    }
}

export default BackgroundTopView;