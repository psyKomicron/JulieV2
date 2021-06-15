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
exports.ExploreCommand = void 0;
const Printer_1 = require("../../../../console/Printer");
const YoutubeExplorer_1 = require("../../command_modules/YoutubeExplorer");
const WikiExplorer_1 = require("../../command_modules/WikiExplorer");
const CommandSyntaxError_1 = require("../../../../errors/command_errors/CommandSyntaxError");
const Command_1 = require("../Command");
class ExploreCommand extends Command_1.Command {
    constructor(bot) {
        super("explore", bot, false);
    }
    execute(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            this.wrapper = wrapper;
            let params = this.getParams(wrapper);
            let keyword = params.keyword;
            let domain = params.domain;
            Printer_1.Printer.title("explorer");
            Printer_1.Printer.args(["keyword", "domain name"], [`${keyword}`, `${domain}`]);
            let e;
            switch (domain) {
                case Domain.YOUTUBE:
                    e = new YoutubeExplorer_1.YTExplorer(keyword, this);
                    break;
                case Domain.WIKIPEDIA:
                    e = new WikiExplorer_1.WikiExplorer(keyword, this);
                    break;
            }
            e.explore();
            wrapper.delete(1000);
        });
    }
    send(embed) {
        this.wrapper.sendToChannel(embed);
    }
    getParams(wrapper) {
        let keyword = undefined;
        let domain = undefined;
        if (wrapper.hasValue(["k", "keyword"])) {
            keyword = wrapper.getValue(["k", "keyword"]);
        }
        if (wrapper.hasValue(["yt", "youtube"])) {
            domain = Domain.YOUTUBE;
        }
        if (wrapper.hasValue(["w", "wiki"])) {
            if (!domain) {
                throw new CommandSyntaxError_1.CommandSyntaxError(this, "Duplicate domain name use. You can set the search to be on Youtube or Wikipedia but not both");
            }
            else {
                domain = Domain.WIKIPEDIA;
            }
        }
        return { keyword, domain };
    }
}
exports.ExploreCommand = ExploreCommand;
var Domain;
(function (Domain) {
    Domain["YOUTUBE"] = "youtube";
    Domain["WIKIPEDIA"] = "wikipedia";
})(Domain || (Domain = {}));
//# sourceMappingURL=ExploreCommand.js.map