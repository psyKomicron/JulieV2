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
exports.WikiExplorer = void 0;
const Explorer_1 = require("./Explorer");
const discord_js_1 = require("discord.js");
const EmbedFactory_1 = require("../../../factories/EmbedFactory");
const Printer_1 = require("../../../console/Printer");
class WikiExplorer extends Explorer_1.Explorer {
    explore() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.getHTML(this.urlize(`https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=`, this.keyword, "%20"));
            let map = this.parseRes(res);
            let embed = EmbedFactory_1.EmbedFactory.build({
                description: `Search for "${this.keyword}"`,
                title: "Wikipedia"
            });
            map.forEach((snippet, title) => {
                if (title != "totalhits") {
                    embed.addField(title, snippet + "[...]");
                }
                else {
                    embed.addField("Total hits", snippet);
                }
            });
            try {
                embed.setURL(this.urlize(`https://en.wikipedia.org/wiki/`, embed.fields[1].name, "_"));
            }
            catch (error) {
                if (!(error instanceof discord_js_1.DiscordAPIError)) {
                    Printer_1.Printer.error(error.toString());
                }
            }
            this.send(embed);
        });
    }
    parseRes(res) {
        let map = new Map();
        try {
            let obj = JSON.parse(res);
            let query = obj["query"];
            let totalhits = query["searchinfo"]["totalhits"];
            map.set("totalhits", totalhits);
            for (let propName in query) {
                if (propName == "search") {
                    let prop = query[propName];
                    for (var i = 0; i < prop.length; i++) {
                        let result = prop[i];
                        let title = result["title"];
                        let snippet = result["snippet"];
                        if (title && snippet) {
                            map.set(title, this.removeHTML(snippet));
                        }
                    }
                }
            }
        }
        catch (error) {
            Printer_1.Printer.error(error.toString());
        }
        return map;
    }
    removeHTML(html) {
        let text = "";
        for (var i = 0; i < html.length; i++) {
            if (html.charAt(i) == '<') {
                let j = i;
                while (html.charAt(j) != '>') {
                    j++;
                }
                i = j;
            }
            else
                text += html.charAt(i);
        }
        return text;
    }
}
exports.WikiExplorer = WikiExplorer;
//# sourceMappingURL=WikiExplorer.js.map