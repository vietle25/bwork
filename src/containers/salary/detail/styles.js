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
	total: {
		backgroundColor: Colors.COLOR_WHITE,
		height: Constants.HEADER_HEIGHT,
		marginBottom: Constants.MARGIN_LARGE,
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
		marginLeft: Constants.MARGIN_12,
		marginVertical: Constants.BUTTON_RADIUS
	},
	textName: {
		...commonStyles.textLargeBold,
		marginVertical: Constants.MARGIN_24,
		marginLeft: Constants.MARGIN_12
	},
	hr: {
		borderBottomColor: Colors.COLOR_HR,
		borderBottomWidth: 2,
		marginLeft: 24, marginRight: 24
	},
	detailSalary: {
		backgroundColor: Colors.COLOR_WHITE,
		height: 290,
		marginBottom: Constants.MARGIN_LARGE
	},
	totalSalary: {
		backgroundColor: Colors.COLOR_WHITE,
		height: 130,
		marginBottom: Constants.MARGIN_LARGE
	},
	viewLeft: {

	},
	textLeftBonus: {
		...commonStyles.text,
		color: Colors.COLOR_PRIMARY,
		fontWeight: 'bold',
		margin: Constants.PADDING_X_LARGE
	},
	textLeftFine: {
		...commonStyles.text,
		color: Colors.COLOR_RED,
		fontWeight: 'bold',
		margin: Constants.PADDING_X_LARGE
	},
	textRight: {
		textAlign: 'right',
		...commonStyles.text,
		fontWeight: 'bold',
		margin: Constants.PADDING_X_LARGE
	}
};
