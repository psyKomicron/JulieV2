"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseType = exports.Tools = void 0;
class Tools {
    static getUrlRegex() {
        return /(https?: \/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    }
    static getNumbersRegex() {
        return /([0-9]{2}|[0-9]{1}):([0-9]{2}|[0-9]{1})/g;
    }
    static getUserRegex() {
        return /[A-Za-z0-9]+#+[0-9]{3,}/g;
    }
    static isUrl(url) {
        return url.match(this.getUrlRegex()) != null;
    }
    static isDate(numbers) {
        return (numbers.match(this.getNumbersRegex())) != null;
    }
    static isNullOrEmpty(s) {
        if (s) {
            if (s.length > 0) {
                for (var i = 0; i < s.length; i++) {
                    if (s[i] != " ")
                        return false;
                }
                return true;
            }
            else
                return true;
        }
        else
            return true;
    }
    static cleanHtml(text) {
        let value = text;
        const lookup = [
            { "regex": /(&amp;)/g, "replace": "&" },
            { "regex": /(&quote;)/g, "replace": "\"" }
        ];
        for (var i = 0; i < lookup.length; i++) {
            if (value.match(lookup[i].regex)) {
                value = value.replace(lookup[i].regex, lookup[i].replace);
            }
        }
        for (var j = 32; j < 101; j++) {
            let regex = new RegExp(`&#[${j}]+;`);
            if (value.match(regex)) {
                value = value.replace(regex, String.fromCharCode(j));
            }
        }
        return value;
    }
    static getRelease(value) {
        switch (value) {
            case "alpha":
                return ReleaseType.ALPHA;
            case "test":
                return ReleaseType.TEST;
            default:
                return ReleaseType.PROD;
        }
    }
    static sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    static slice(array, end, start = 0) {
        return array.slice(start, end);
    }
    static isSameDay(date1, date2) {
        return (date1.getFullYear() == date2.getFullYear()
            && date1.getMonth() == date2.getMonth()
            && date1.getDate() == date2.getDate()
            && date1.getDay() == date2.getDay());
    }
}
exports.Tools = Tools;
var ReleaseType;
(function (ReleaseType) {
    ReleaseType["ALPHA"] = "alpha";
    ReleaseType["TEST"] = "test";
    ReleaseType["PROD"] = "";
})(ReleaseType = exports.ReleaseType || (exports.ReleaseType = {}));
//# sourceMappingURL=Tools.js.map