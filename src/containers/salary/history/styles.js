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
	date: {
		backgroundColor: Colors.COLOR_WHITE,
		height: Constants.HEADER_HEIGHT,
		marginBottom: Constants.MARGIN_LARGE,
		paddingHorizontal: Constants.PADDING_X_LARGE + Constants.PADDING_LARGE
	},
	month: {
		backgroundColor: Colors.COLOR_WHITE,
		height: Constants.HEADER_HEIGHT,
		marginBottom: Constants.MARGIN_X_LARGE
	},
	boxView: {
		...commonStyles.viewCenter,
		backgroundColor: Colors.COLOR_WHITE,
		marginVertical: Constants.MARGIN_LARGE,
		padding: Constants.PADDING_X_LARGE + Constants.PADDING_LARGE
	},
	buttonCheck: {
		...commonStyles.viewCenter,
		width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.COLOR_PRIMARY
	},
	textInCheck: {
		...commonStyles.text,
		color: Colors.COLOR_WHITE
	},

	textPeriod: {
		...commonStyles.text,
		marginLeft: Constants.MARGIN_X_LARGE,
		marginVertical: Constants.BUTTON_RADIUS
	},
	textName: {
		...commonStyles.textLargeBold,
		marginVertical: Constants.MARGIN_24,
		marginLeft: Constants.MARGIN_X_LARGE
	},
	hr: {
		borderBottomColor: Colors.COLOR_HR,
		borderBottomWidth: 2,
		marginHorizontal: 20
	},
	detailSalary: {
		backgroundColor: Colors.COLOR_WHITE,
		marginBottom: Constants.MARGIN_X_LARGE,
		paddingHorizontal: Constants.PADDING
	},
	totalSalary: {
		backgroundColor: Colors.COLOR_WHITE,
		marginBottom: Constants.MARGIN_LARGE,
		paddingHorizontal: Constants.PADDING
	},
	viewLeft: {

	},
	textLeft: {
		...commonStyles.text,
		marginBottom: Constants.PADDING_X_LARGE,
		marginLeft: Constants.MARGIN_X_LARGE
	},
	textLeftGreen: {
		...commonStyles.text,
		color: Colors.COLOR_PRIMARY,
		marginBottom: Constants.PADDING_X_LARGE,
		marginLeft: Constants.MARGIN_X_LARGE
	},
	textRightGreen: {
		textAlign: 'right',
		...commonStyles.text,
		color: Colors.COLOR_PRIMARY,
		marginBottom: Constants.PADDING_X_LARGE,
		marginRight: Constants.MARGIN_X_LARGE
	},
	textRight: {
		textAlign: 'right',
		...commonStyles.text,
		marginBottom: Constants.PADDING_X_LARGE,
		marginRight: Constants.MARGIN_X_LARGE
	}
};
