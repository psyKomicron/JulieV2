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
exports.Bot = void 0;
const readline = require("readline");
const TokenReader_1 = require("../../dal/readers/TokenReader");
const discord_js_1 = require("discord.js");
const DefaultLogger_1 = require("./command_modules/logger/loggers/DefaultLogger");
const Printer_1 = require("../../console/Printer");
const CommandFactory_1 = require("../../factories/CommandFactory");
const Tools_1 = require("../../helpers/Tools");
const Config_1 = require("../../dal/Config");
const ConfigurationError_1 = require("../../errors/dal_errors/ConfigurationError");
const Moderator_1 = require("./command_modules/moderation/Moderator");
const events_1 = require("events");
const MessageWrapper_1 = require("../common/MessageWrapper");
const ErrorTranslater_1 = require("../../errors/ErrorTranslater");
const Command_1 = require("./commands/Command");
class Bot extends events_1.EventEmitter {
    constructor(effect) {
        super();
        this._logger = new DefaultLogger_1.DefaultLogger();
        this.errorTranslater = new ErrorTranslater_1.ErrorTranslater();
        this._client = new discord_js_1.Client();
        this.moderator = Moderator_1.Moderator.get(this);
        this.verbose = Config_1.Config.getVerbose();
        this.parents = Config_1.Config.getAuthorizedUsers();
        this.prefix = Config_1.Config.getPrefix();
        Config_1.Config.onEvent("prefixChange", (newPrefix) => this.onPrefixChange(newPrefix));
        Config_1.Config.onEvent("addUser", (user) => this.onUserAdd(user));
        this._client.on("message", (message) => this.onMessage(new MessageWrapper_1.MessageWrapper(message)));
        this._client.on("ready", () => {
            effect.stop();
            readline.moveCursor(process.stdout, -3, 0);
            process.stdout.write("Ready\n");
            Printer_1.Printer.error(Printer_1.Printer.repeat("-", 34));
            Printer_1.Printer.printConfig();
        });
        this._client.on("disconnect", (arg_0, arg_1) => {
            console.log("Client disconnected :");
            console.log(`${JSON.stringify(arg_0)}, ${arg_1}`);
            Printer_1.Printer.writeLog("Bot disconnected. API message: " + JSON.stringify(arg_0) + ", " + arg_1, Printer_1.LogLevels.Warning);
        });
        this._client.login(TokenReader_1.TokenReader.getToken("discord"))
            .then((value) => {
            this.currentPresenceData = {
                status: "dnd",
                afk: false,
                activity: {
                    name: this.prefix + "help",
                    type: "PLAYING",
                    url: "https://github.com/psyKomicron/JulieV2/tree/dev"
                }
            };
            this._client.user.setPresence(this.currentPresenceData);
            Printer_1.Printer.writeLog("Bot logged in with " + value, Printer_1.LogLevels.Info);
        })
            .catch((reason) => {
            effect.stop();
            Printer_1.Printer.clear();
            Printer_1.Printer.error(reason.toString());
            Printer_1.Printer.error("\nFatal error, application will not start. Press CTRL+C to stop");
        });
    }
    get prefixLength() { return this.prefix.length; }
    get client() { return this._client; }
    get logger() { return this._logger; }
    static get(effect) {
        if (!this.instance) {
            this.instance = new Bot(effect);
        }
        return this.instance;
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    handleErrorForClient(error, message) {
        if (this.verbose > 1) {
            message.message.author.send(this.errorTranslater.translate(error, message));
        }
    }
    isAuthorized(user) {
        return this.parents.includes(user.tag);
    }
    onMessage(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Tools_1.Tools.isNullOrEmpty(Config_1.Config.getGuild())
                && wrapper.message.guild
                && wrapper.message.guild.available
                && wrapper.message.guild.name != Config_1.Config.getGuild()) {
                if (Config_1.Config.getVerbose() > 2 && !wrapper.message.guild) {
                    Printer_1.Printer.writeLog("#UNDEFINED_GUILD Received message from undefined guild, not handling", Printer_1.LogLevels.Info);
                }
                return;
            }
            try {
                wrapper.parseMessage(this.prefix.length);
                let content = wrapper.content;
                if (content.startsWith(this.prefix)) {
                    this.moderator.execute(wrapper);
                    if (this.isAuthorized(wrapper.message.author)) {
                        wrapper.type();
                        Printer_1.Printer.info("\n(" + new Date(Date.now()).toISOString() + ") command requested by : " + wrapper.message.author.tag);
                        if (this._logger) {
                            let handled = this._logger.handle(wrapper);
                            if (!handled) {
                                let name = Command_1.Command.getCommandName(content);
                                Printer_1.Printer.writeLog("Command requested by : " + wrapper.message.author.tag + " | command name: " + name + " | content: " + wrapper.commandContent, Printer_1.LogLevels.Info);
                                let command = CommandFactory_1.CommandFactory.create(name.substr(this.prefix.length), this);
                                wrapper.parseMessage(this.prefix.length);
                                yield command.execute(wrapper);
                                if (command.deleteAfterExecution) {
                                    wrapper.delete(300);
                                }
                            }
                        }
                        wrapper.stopTyping();
                    }
                    else {
                        Printer_1.Printer.writeLog("Unauthorized use of bot by: " + wrapper.message.author.tag, Printer_1.LogLevels.Warning);
                    }
                }
            }
            catch (error) {
                Printer_1.Printer.error(error.toString());
                Printer_1.Printer.writeLog(error.toString() + "\n" + "Received: \"" + wrapper.content + "\" from " + wrapper.message.author.tag, Printer_1.LogLevels.Error);
                this.handleErrorForClient(error, wrapper);
            }
        });
    }
    onPrefixChange(prefix) {
        if (prefix.length > 0) {
            this.prefix = prefix;
            this.currentPresenceData.activity.name = prefix + "help";
            this.client.user.setPresence(this.currentPresenceData);
        }
        else {
            throw new ConfigurationError_1.ConfigurationError("Given prefix is not valid.");
        }
    }
    onUserAdd(user) {
        if (!this.parents.includes(user.tag)) {
            this.parents.push(user.tag);
        }
    }
}
exports.Bot = Bot;
//# sourceMappingURL=Bot.js.map