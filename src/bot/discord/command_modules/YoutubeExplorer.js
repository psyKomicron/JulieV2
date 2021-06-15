"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YTExplorer = void 0;
const Explorer_1 = require("./Explorer");
const YoutubeModule_1 = require("./youtube/YoutubeModule");
const TokenReader_1 = require("../../../dal/readers/TokenReader");
const EmptyTokenError_1 = require("../../../errors/dal_errors/EmptyTokenError");
const Printer_1 = require("../../../console/Printer");
const EmbedFactory_1 = require("../../../factories/EmbedFactory");
class YTExplorer extends Explorer_1.Explorer {
    explore() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let ytModule = new YoutubeModule_1.YoutubeModule(TokenReader_1.TokenReader.getToken("youtube"));
                ytModule.searchVideos(this.keyword, 10, "en")
                    .then(res => this.workFromResponse(res))
                    .catch(console.error);
            }
            catch (e) {
                if (e instanceof EmptyTokenError_1.EmptyTokenError) {
                    Printer_1.Printer.error("YoutubeModule cannot log in with an empty token");
                    Printer_1.Printer.error(e.toString());
                }
                else {
                    Printer_1.Printer.warn("Uncatched error : " + e.toString());
                }
            }
        });
    }
    workFromResponse(res) {
        let embed = EmbedFactory_1.EmbedFactory.build({
            title: "Youtube",
            description: `Youtube search for \`${this.keyword}\``,
        });
        for (var i = 0; i < 10 && i < res.items.length; i++) {
            let item = res.items[i];
            let name = "**" + item.title + "**";
            let value = item.videoURL;
            if (name && value) {
                embed.addField(name, value);
            }
        }
        embed.setURL(res.items[0].videoURL);
        this.send(embed);
    }
}
exports.YTExplorer = YTExplorer;
//# sourceMappingURL=YoutubeExplorer.js.map