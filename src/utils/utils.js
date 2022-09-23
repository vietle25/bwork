import StringUtil from "./stringUtil";
import { toArray } from "react-emoji-render";

export default class Utils {

    static chunkArray(array, size) {
        if (array == []) return [];
        return array.reduce((acc, val) => {
            if (acc.length === 0) acc.push([]);
            const last = acc[acc.length - 1];
            if (last.length < size) {
                last.push(val);
            } else {
                acc.push([val]);
            }
            return acc;
        }, []);
    }

    static hex2rgb(hex, opacity) {
        hex = hex.trim();
        hex = hex[0] === '#' ? hex.substr(1) : hex;
        var bigint = parseInt(hex, 16), h = [];
        if (hex.length === 3) {
            h.push((bigint >> 4) & 255);
            h.push((bigint >> 2) & 255);
        } else {
            h.push((bigint >> 16) & 255);
            h.push((bigint >> 8) & 255);
        }
        h.push(bigint & 255);
        if (arguments.length === 2) {
            h.push(opacity);
            return 'rgba(' + h.join() + ')';
        } else {
            return 'rgb(' + h.join() + ')';
        }
    }

    /**
     * Validate email
     * @param {*} email 
     */
    static validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email)
    }

    /**
     * Validate phone
     * @param {*} phone 
     */
    static validatePhone(phone) {
        // var re = /^(\([0-9]{3}\)|[0-9]{3}-)[0-9]{3}-[0-9]{4}$/;
        // var re = /(\+84|0)([35789]\d{8}|1\d{9})$/g;
        var re = /^0(3[23456789]|5[2689]|7[06789]|8[123456789]|9[012346789])\d{7}$/;
        return re.test(phone)
    }

    /**
     * Validate date of bird
     * @param {*} dateOfBird 
     */
    static validateDate(dateOfBird) {
        var re = /^([0-3]{1})([0-9]{1})\/([0-1]{1})([0-9]{1})\/([0-9]{4})$/;
        return re.test(dateOfBird)
    }

    /**
     * Validate hour
     * @param {*} string
     */
    static validHour = (string) => {
        var re = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/;
        return re.test(string)
    }

    /**
     * Check data null
     * @param {*} data 
     */
    static isNull(data) {
        if (data == undefined || data == null || data.length == 0) {
            return true
        } else if (typeof data == "string") {
            return StringUtil.isNullOrEmpty(data)
        }
        return false
    }

    /**
     * Random String
     * @param {*} length 
     * @param {*} chars 
     */
    static randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    }

    /**
     * Get length of number
     * Ex: 12 => func return 2
     * Ex: 1  => func return 1
     * @param {*} number
     */
    static getLength(number) {
        return (number + '').replace('.', '').length;  // for floats
    }

    /**
     * calculatorBMI 
     * @param {*} weight (kg)
     * @param {*} height (cm)
     */
    static calculatorBMI(weight, height) {
        let calculateBMI = (weight / Math.pow(height / 100, 2)).toFixed(1);
        return calculateBMI
    }

    /**
     * Validate contain upper password 
     * @param {*} passWord
     */
    static validateContainUpperPassword(passWord) {
        var re = /[A-Z]/;
        return re.test(passWord)
    }

    /**
     * Rotate image
     * @param orientation
     */
    static rotateImage(orientation) {
        let degRotation;
        switch (orientation) {
            case 90:
                degRotation = 90
                break;
            case 270:
                degRotation = -90
                break;
            case 180:
                degRotation = 180
                break;
            default:
                degRotation = 0
        }
        return degRotation;
    }

    /**
     * Parse emojis
     * @param value
     */
    static parseEmojis = value => {
        const emojisArray = toArray(value);

        // toArray outputs React elements for emojis and strings for other
        const newValue = emojisArray.reduce((previous, current) => {
            if (typeof current === "string") {
                return previous + current;
            }
            return previous + current.props.children;
        }, "");

        return newValue;
    };

    /**
     * Format mac address
     * @param {*} macAdress 
     */
    static formatMacAddress = macAdress => {
        let res = macAdress.split(":");
        for (let i = 0; i < res.length; i++) {
            let element = res[i];
            if (element.length === 1) {
                res[i] = "0" + element;
            }
        }
        return res.join(':');
    }
}
