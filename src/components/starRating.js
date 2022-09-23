import React, { Component } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import ic_star_blue from "images/ic_star_blue.png";
import ic_star_grey from "images/ic_star_grey.png";
import Utils from 'utils/utils';

export default class StarRating extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        // Recieve the ratings object from the props
        let ratingObj = this.props.ratingObj;
        let myStyleViews = this.props.myStyleViews;
        let myStyleContainer = this.props.myStyleContainer;
        let styleImage = this.props.styleImage;

        // This array will contain our star tags. We will include this
        // array between the view tag.
        let stars = [];
        // Loop 5 times
        for (var i = 1; i <= 5; i++) {
            // set the path to filled stars
            let path = ic_star_blue
            // If ratings is lower, set the path to unfilled stars
            if (i > ratingObj.ratings) {
                path = ic_star_grey
            }

            stars.push((<Image style={styles.image} source={path} style={styleImage} />));
        }

        return (
            <View style={[styles.container, myStyleContainer]}>
                {stars}
                <Text style={[styles.text, myStyleViews]}>{!Utils.isNull(ratingObj.views) ? "(" + ratingObj.views + ")" : null}</Text>
            </View>
        );
    }
}

StarRating.propTypes = {
    ratingObj: PropTypes.object,
    // {
    //     ratings: PropTypes.number,
    //     views: PropTypes.number
    // }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    image: {
        width: 8,
        height: 8
    },
    text: {
        fontSize: 8,
        marginLeft: 10,
        marginRight: 10
    }
});
