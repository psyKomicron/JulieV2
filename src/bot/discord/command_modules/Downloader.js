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
exports.Downloader = void 0;
const request = require("request");
const ProgressBar_1 = require("../../../console/effects/ProgressBar");
const FileSystem_1 = require("../../../dal/FileSystem");
const Printer_1 = require("../../../console/Printer");
class Downloader {
    constructor(folderName) {
        if (folderName != "." && folderName != "..") {
            this._path = `./files/downloads/${folderName}/`;
            if (!FileSystem_1.FileSystem.exists(this.path)) {
                FileSystem_1.FileSystem.mkdir(this.path, true);
            }
        }
    }
    download(urls) {
        return __awaiter(this, void 0, void 0, function* () {
            let names = new Array();
            for (var j = 0; j < urls.length; j++) {
                names.push(Downloader.getFileName(urls[j]));
            }
            names = this.renameFiles(names);
            let bar = new ProgressBar_1.ProgressBar(urls.length, "downloading");
            bar.start();
            for (var i = 0; i < urls.length; i++) {
                if (urls[i] == undefined) {
                    throw new Error("url at index " + i + "was undefined");
                }
                let path = this.path + names[i];
                let file = FileSystem_1.FileSystem.createWriteStream(path, { flags: "w" });
                bar.update(i + 1);
                let req = request.get(urls[i]);
                req.on("response", (response) => {
                    if (response.statusCode > 300 && response.statusCode < 600) {
                        let code = response.statusCode;
                        console.log(`${urls[i]}`);
                        switch (code) {
                            case 400:
                                Printer_1.Printer.warn(`[${code}] Bad Request !`);
                                break;
                            case 403:
                                Printer_1.Printer.warn(`[${code}] Forbidden !`);
                                break;
                            case 409:
                                Printer_1.Printer.warn(`[${code}] Conflict !`);
                                break;
                            case 401:
                                Printer_1.Printer.warn(`[${code}] Unauthorized !`);
                                break;
                            case 404:
                                Printer_1.Printer.warn(`[${code}] Not Found !`);
                                break;
                            case 500:
                                Printer_1.Printer.warn(`[${code}] Internal Server Error !`);
                                break;
                            default:
                                Printer_1.Printer.warn(code);
                        }
                    }
                });
                req.on("error", err => {
                    console.error(names[i] + " " + err);
                    FileSystem_1.FileSystem.appendToFile(`${this.path}/0_logs.txt`, names[i] + " -> error ");
                    FileSystem_1.FileSystem.unlink(path);
                });
                req.pipe(file);
                file.on("finish", () => {
                    file.close();
                });
                file.on("error", err => {
                    FileSystem_1.FileSystem.unlink(path);
                    throw err;
                });
            }
            bar.stop();
            let downloadedItems = "";
            urls.forEach(url => {
                downloadedItems += "[" + new Date(Date.now()).toISOString() + "]" + url + "\n";
            });
            FileSystem_1.FileSystem.appendToFile(this.path + "0_logs.txt", `${downloadedItems}\n`);
        });
    }
    renameFiles(names) {
        let map = new Map();
        for (var i = 0; i < names.length; i++) {
            if (!map.get(names[i])) {
                map.set(names[i], true);
            }
            else {
                let old_name = names[i];
                let current_name = old_name.split(".")[0];
                let ext = "." + old_name.split(".")[1];
                let n = 1;
                while (map.get(current_name + ext)) {
                    let temp_name = current_name;
                    temp_name += `(${n})`;
                    if (!map.get(temp_name + ext))
                        current_name = temp_name;
                    n++;
                }
                map.set(current_name + ext, true);
            }
        }
        let array = new Array();
        map.forEach((v, k) => {
            array.push(k);
        });
        return array;
    }
    get path() {
        return this._path;
    }
    static getFileName(url) {
        let substr = url.split("/");
        return substr[substr.length - 1];
    }
}
exports.Downloader = Downloader;
//# sourceMappingURL=Downloader.js.map