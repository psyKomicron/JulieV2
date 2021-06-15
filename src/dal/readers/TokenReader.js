"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenReader = void 0;
const EmptyTokenError_1 = require("../../errors/dal_errors/EmptyTokenError");
const Config_1 = require("../Config");
class TokenReader {
    static getToken(tokenName) {
        switch (tokenName) {
            case "youtube":
                return Config_1.Config.getKey("youtubeApiKey");
            case "release":
                return Config_1.Config.getKey("release");
            case "discord":
                return Config_1.Config.getKey("discordBotKey");
        }
        throw new EmptyTokenError_1.EmptyTokenError("Could not get token from env variable. Token name : " + tokenName);
    }
}
exports.TokenReader = TokenReader;
var Token;
(function (Token) {
    Token[Token["youtube"] = 0] = "youtube";
    Token[Token["release"] = 1] = "release";
    Token[Token["discord"] = 2] = "discord";
})(Token || (Token = {}));
//# sourceMappingURL=TokenReader.js.map