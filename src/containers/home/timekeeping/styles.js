import React from "react-native";
import { Constants } from "values/constants";
import { Colors } from "values/colors";
import commonStyles from "styles/commonStyles";
import { Fonts } from "values/fonts";

const { Dimensions, Platform } = React;
const deviceHeight = Dimensions.get("window").height;
const { StyleSheet } = React;

export default {
	circleCheck: {
		width: 15,
		height: 15,
		borderRadius: 7.5,
		borderWidth: 1
	},
	borderCheck: {
		width: 1,
		marginHorizontal: 7,
		backgroundColor: Colors.COLOR_PRIMARY,
		height: 18
	}
};
