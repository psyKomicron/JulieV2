"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONParser = void 0;
class JSONParser {
    static matchTemplate(json, template) {
        let match = false;
        for (let rootName in template) {
            let matchingRoot = template[rootName];
            let root = json[rootName];
            if (root != undefined && typeof root == "object") {
                match = this.matchTemplate(root, matchingRoot);
                if (!match)
                    break;
            }
            else if (root != undefined) {
                match = true;
            }
            else {
                match = false;
                break;
            }
        }
        return match;
    }
}
exports.JSONParser = JSONParser;
//# sourceMappingURL=JSONParser.js.map