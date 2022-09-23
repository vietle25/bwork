import React from "react-native";
import { Constants } from "values/constants";
import { Colors } from "values/colors";
import commonStyles from "styles/commonStyles";
import { Fonts } from "values/fonts";

const { Dimensions, Platform } = React;
const window = Dimensions.get("window");
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
	date: {
		...commonStyles.viewHorizontal,
		alignItems: 'center',
		backgroundColor: Colors.COLOR_WHITE,
		height: Constants.HEADER_HEIGHT,
		paddingHorizontal: Constants.PADDING_LARGE + Constants.PADDING
	},
};
