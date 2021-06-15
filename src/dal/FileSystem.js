"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = void 0;
const fs = require("fs");
class FileSystem {
    static readFile(path) {
        return fs.readFileSync(path);
    }
    static appendToFile(path, content) {
        fs.appendFileSync(path, content);
    }
    static appendToFileAsync(path, content, callback) {
        if (callback != undefined) {
            fs.appendFile(path, content, callback);
        }
        else {
            fs.appendFile(path, content, (err) => console.error(err));
        }
    }
    static writeFile(path, content) {
        fs.writeFileSync(path, content);
    }
    static exists(path) {
        return fs.existsSync(path);
    }
    static mkdir(path, recursive = false) {
        return fs.mkdirSync(path, { recursive: recursive });
    }
    static rmdir(path) {
        fs.rmdirSync(path);
    }
    static unlink(path) {
        fs.unlinkSync(path);
    }
    static getStats(path) {
        return fs.statSync(path);
    }
    static createReadStream(path, opt) {
        return fs.createReadStream(path, opt);
    }
    static createWriteStream(path, opt) {
        return fs.createWriteStream(path, opt);
    }
}
exports.FileSystem = FileSystem;
//# sourceMappingURL=FileSystem.js.map