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
exports.EmbedCommand = void 0;
const Command_1 = require("../Command");
const Downloader_1 = require("../../command_modules/Downloader");
const Printer_1 = require("../../../../console/Printer");
const EmbedFactory_1 = require("../../../../factories/EmbedFactory");
const FileSystem_1 = require("../../../../dal/FileSystem");
const ArgumentError_1 = require("../../../../errors/ArgumentError");
class EmbedCommand extends Command_1.Command {
    constructor(bot) {
        super(EmbedCommand.name, bot);
    }
    execute(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            let values = this.getParams(wrapper);
            if (values[0] == undefined) {
                throw new ArgumentError_1.ArgumentError("Channel cannot be resolved", "channel");
            }
            let fileUrl;
            wrapper.message.attachments.forEach(value => {
                if (value.url.endsWith(".json"))
                    fileUrl = value.url;
            });
            if (fileUrl) {
                let jsonName = Downloader_1.Downloader.getFileName(fileUrl);
                console.log(Printer_1.Printer.args(["json file name", "json file url", "delete after execution", "channel"], [`${jsonName}`, `${fileUrl}`, `${values[1]}`, `${values[0].name}`]));
                let downloader = new Downloader_1.Downloader(this.name);
                yield downloader.download([fileUrl]);
                setTimeout(() => {
                    let fileContent = FileSystem_1.FileSystem.readFile(`${downloader.path}${jsonName}`).toString();
                    try {
                        let json = JSON.parse(fileContent);
                        Printer_1.Printer.clearPrint("Object has all required properties", [0, -2]);
                        console.log();
                        let discordEmbed = EmbedFactory_1.EmbedFactory.build(json);
                        values[0].send(discordEmbed);
                    }
                    catch (error) {
                        if (error instanceof Error) {
                            if (error.message == "Cannot use object") {
                                Printer_1.Printer.clearPrint("", [0, -1]);
                            }
                        }
                        Printer_1.Printer.error(error.toString());
                    }
                    finally {
                        FileSystem_1.FileSystem.unlink(`${downloader.path}${jsonName}`);
                        FileSystem_1.FileSystem.unlink(`${downloader.path}logs.txt`);
                        FileSystem_1.FileSystem.rmdir(`${downloader.path}`);
                    }
                }, 1000);
            }
            else {
                Printer_1.Printer.args([Printer_1.Printer.pRed("json file url"), "delete after execution"], [`${Printer_1.Printer.error(fileUrl)}`, `${values[1]}`]);
                throw new Error("No valid uri/url for the json file");
            }
        });
    }
    getParams(wrapper) {
        let willDelete = false;
        if (wrapper.has("d")) {
            willDelete = true;
        }
        let channel = this.resolveTextChannel(wrapper);
        return [channel, willDelete];
    }
}
exports.EmbedCommand = EmbedCommand;
//# sourceMappingURL=EmbedCommand.js.map