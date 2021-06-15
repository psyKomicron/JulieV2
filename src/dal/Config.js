"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const FileSystem_1 = require("./FileSystem");
const ConfigurationError_1 = require("../errors/dal_errors/ConfigurationError");
const JSONParser_1 = require("../helpers/JSONParser");
const events_1 = require("events");
const Printer_1 = require("../console/Printer");
const EmojiReader_1 = require("./readers/EmojiReader");
const Tools_1 = require("../helpers/Tools");
class Config extends events_1.EventEmitter {
    static init() {
        if (!this.isInit) {
            if (FileSystem_1.FileSystem.exists(this.path)) {
                let config = JSON.parse(FileSystem_1.FileSystem.readFile(this.path).toString());
                if (JSONParser_1.JSONParser.matchTemplate(config, this.configTemplate)) {
                    this.prefix = config["prefix"];
                    this.verbose = config["verbose"];
                    let directories = config["startdirectories"];
                    directories.forEach(dir => {
                        if (!FileSystem_1.FileSystem.exists(dir)) {
                            FileSystem_1.FileSystem.mkdir(dir);
                        }
                        this.startDirectories.push(dir);
                    });
                    let users = config["authorizedusers"];
                    users.forEach(user => {
                        var _a;
                        if ((_a = user) === null || _a === void 0 ? void 0 : _a.match(Tools_1.Tools.getUserRegex())) {
                            this.authorizedUsers.push(user);
                        }
                    });
                    let keys = config["keys"];
                    keys.forEach(pair => {
                        if (pair.value.match(/^[A-z0-9.]+(?! )[A-z0-9.]+$/g) && !pair.key.match(/ +/)) {
                            this.keys.set(pair.key, pair.value);
                        }
                        else {
                            throw new ConfigurationError_1.ConfigurationError("API key does not match required format (chars without spaces) or key name contains a space");
                        }
                    });
                    this.guild = config["guild"];
                }
                else {
                    throw new ConfigurationError_1.ConfigurationError("Configuration file is malformed, please check file integrity.");
                }
                EmojiReader_1.EmojiReader.init();
            }
            else {
                throw new ConfigurationError_1.ConfigurationError("Configuration file is either not present, or not accessible. Please check.");
            }
        }
        else {
            throw new ConfigurationError_1.ConfigurationError("Configuration file has already been loaded. Do not instanciate the Config class twice.");
        }
    }
    static getPath() {
        return this.path;
    }
    static getDirectories() {
        return this.startDirectories;
    }
    static getVerbose() {
        return this.verbose;
    }
    static getAuthorizedUsers() {
        return this.authorizedUsers;
    }
    static addAuthorizedUser(user) {
        let configFile = JSON.parse(FileSystem_1.FileSystem.readFile(this.path).toString());
        if (JSONParser_1.JSONParser.matchTemplate(configFile, this.configTemplate)) {
            let authorizedUsers = configFile.authorizedusers;
            if (authorizedUsers && authorizedUsers instanceof Array) {
                try {
                    authorizedUsers.push(user.tag);
                    this.config.emit("addUser", user);
                }
                catch (error) {
                    Printer_1.Printer.error(error.toString());
                }
            }
            else {
                throw new ConfigurationError_1.ConfigurationError("Configuration file is malformed, please check file integrity.");
            }
        }
    }
    static getEmojisFilePath() {
        return this.emojisFilePath;
    }
    static getDownloadPath() {
        return this.downloadPath;
    }
    static getGitRepoPath() {
        return this.gitRepoPath;
    }
    static getPrefix() {
        return this.prefix;
    }
    static setPrefix(prefix) {
        this.prefix = prefix;
        this.config.emit("prefixChange", prefix);
    }
    static getKeys() {
        return this.keys;
    }
    static getKey(keyName) {
        let value = this.keys.get(keyName);
        if (!value) {
            throw new ConfigurationError_1.ConfigurationError("The key does not exist (" + keyName + ")");
        }
        return value;
    }
    static getGuild() {
        return this.guild;
    }
    static emitEvent(event, ...args) {
        this.config.emit(event, ...args);
    }
    static onEvent(event, listener) {
        return this.config.on(event, listener);
    }
}
exports.Config = Config;
Config.config = new Config();
Config.isInit = false;
Config.configTemplate = {
    "prefix": "",
    "authorizedusers": [
        ""
    ],
    "authorizedroles": [
        ""
    ],
    "guild": [
        ""
    ],
    "verbose": 1,
    "startdirectories": [
        ""
    ]
};
Config.startDirectories = new Array();
Config.authorizedUsers = new Array();
Config.keys = new Map();
Config.path = "./config/config.json";
Config.emojisFilePath = "./config/emojis.json";
Config.downloadPath = "./files/downloads/";
Config.gitRepoPath = "https://github.com/psyKomicron/JulieV2/";
//# sourceMappingURL=Config.js.map