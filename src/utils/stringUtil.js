import Utils from "./utils";

export default class StringUtil {

    /**
     * Capital first letter
     * @param {*} string 
     */
    static capitalizeFirstLetter = (string = '') => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Check is null or empty
     * @param {*} string 
     */
    static isNullOrEmpty = (string = '') => {
        return string == ''
    }

    /**
     * string
     */
    static convertMoney = (string) => {
        return string;
    }

    static isParseMoney = (number) => {
        //return number=parseFloat(number.replace(/,/g,''));
        return number = number.replace(/\s?/g, ',').replace(/(\d{3})/g, '$1 ').trim()

    }

    static validSpecialCharacter = (string) => {
        return string.match(/[=+`'$&+,:;=?@#|<>.\-^*()%!]+/g);
    }

    /**
     * Check emoji icon in string
     */
    static validEmojiIcon = (string) => {
        return string.match(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    }

    static formatStringCash(cash, formatType = '.') {
        var result = [];
        if (!Utils.isNull(cash)) {
            cash = cash.toString();
            let arrCash = cash.split('');
            arrCash = arrCash.reverse();
            for (let i = 0; i < arrCash.length; i += 3) {
                for (let j = 0; j < 3; j++) {
                    result.push(arrCash[i + j])
                }
                result.push(formatType);
            }
            result = result.reverse();
            result.splice(0, 1);
            result = result.join('') + `${formatType == '.' ? ' VND' : ' USD'}`;
        }
        return result;
    }

    static formatStringCashNoUnit(cash, formatType = '.') {
        var result = [];
        if (!Utils.isNull(cash)) {
            cash = cash.toString();
            let arrCash = cash.split('');
            arrCash = arrCash.reverse();
            for (let i = 0; i < arrCash.length; i += 3) {
                for (let j = 0; j < 3; j++) {
                    result.push(arrCash[i + j])
                }
                result.push(formatType);
            }
            result = result.reverse();
            result.splice(0, 1);
            result = result.join('') + ' đ';
        }
        return result;
    }

    static randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    }

    static formatNumScore(score) {
        return score == 0 || score == null ? 0 : score.toFixed(2)
    }

    /**
     * Counting words in string
     */
    static countWordsInString = (str) => {
        if (str.length === 0) {
            return 0
        } else {
            return str.trim().split(/\s+/).length;
        }
    }

    /**
     * Sub string 
     * @param {*} str // string want to sub
     * @param {*} indexStart // begin from 0.
     * @param {*} indexEnd // index end
     */
    static subString(str, indexStart, indexEnd) {
        if (!Utils.isNull(str)) {
            return String(str).trim().substring(indexStart, indexEnd)
        } else {
            return 0
        }
    }

    /**
     * format licence plate
     * @param {*} str 
     */
    static formatLicencePlate(str) {
        var result = str.toUpperCase().trim().split('-').join("").split('.').join("").split(' ').join("")
        return result
    }

    /**
     * format phone space
     * @param {*} str 
     */
    static formatPhoneSpace(str) {
        var one = ""
        var two = ""
        var there = ""
        if (str.length == 10) {
            var one = str.slice(0, 3)
            var two = str.slice(3, 6)
            var there = str.slice(6, 10)
        } else if (str.length == 11) {
            var one = str.slice(0, 4)
            var two = str.slice(4, 7)
            var there = str.slice(7, 11)
        }
        return one + " " + two + " " + there
    }
}