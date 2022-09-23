import React from "react-native";
import { Constants } from "values/constants";
import { Colors } from "values/colors";
import commonStyles from "styles/commonStyles";
import { Fonts } from "values/fonts";

const { Dimensions, Platform } = React;
const deviceHeight = Dimensions.get("window").height;
const { StyleSheet } = React;

export default {
	container: {
		width: null,
		height: null,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'stretch',
		backgroundColor: Colors.COLOR_BACKGROUND
	},
	boxProcess: {
		backgroundColor: Colors.COLOR_WHITE,
		paddingHorizontal: Constants.PADDING_X_LARGE + Constants.PADDING_LARGE,
		paddingVertical: Constants.PADDING_X_LARGE
	},
	textDay: {
		...commonStyles.text,
		fontSize: 35,
		margin: 0
	}
};
