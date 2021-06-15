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
exports.DeleteCommand = void 0;
const Printer_1 = require("../../../../console/Printer");
const ProgressBar_1 = require("../../../../console/effects/ProgressBar");
const Command_1 = require("../Command");
const DiscordObjectGetter_1 = require("../../../common/DiscordObjectGetter");
class DeleteCommand extends Command_1.Command {
    constructor(bot) {
        super("delete", bot, false);
    }
    execute(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = this.getParams(wrapper);
            Printer_1.Printer.title("deleting messages");
            Printer_1.Printer.args(["number of messages", "channel name", "target user"], [`${params.messages}`, `${params.channel.name}`, `${params.username ? "none" : params.username}`]);
            switch (params.action) {
                case Action.NORMAL:
                    {
                        let dog = new DiscordObjectGetter_1.DiscordObjectGetter();
                        let messages;
                        if (params.username) {
                            let username = params.username;
                            if (params.deletePinned) {
                                messages = yield dog.fetchAndFilter(params.channel, params.messages, (message) => message.author.tag == username, { maxIterations: 5000, allowOverflow: false });
                            }
                            else {
                                messages = yield dog.fetchAndFilter(params.channel, params.messages, (message) => message.author.tag == username && !message.pinned, { maxIterations: 5000, allowOverflow: false });
                            }
                        }
                        else if (!params.deletePinned) {
                            messages = yield dog.fetchAndFilter(params.channel, params.messages, (message) => !message.pinned, { maxIterations: 5000, allowOverflow: false });
                        }
                        else {
                            messages = yield dog.fetch(params.channel, params.messages, { maxIterations: 5000, allowOverflow: false });
                        }
                        yield this.overrideDelete(messages);
                        break;
                    }
                case Action.ARG_LESS:
                    this.bulkDelete(params.channel, params.messages);
                    break;
                case Action.BY_ID:
                    {
                        let ids = params.messageIDs;
                        let dog = new DiscordObjectGetter_1.DiscordObjectGetter();
                        let messages = yield dog.fetchAndFilter(params.channel, params.messages, (message) => ids.indexOf(message.id) != -1, { maxIterations: 5000, allowOverflow: false });
                        yield this.overrideDelete(messages);
                        break;
                    }
                default:
                    break;
            }
        });
    }
    bulkDelete(channel, n) {
        channel.bulkDelete(n)
            .then(response => {
            let bar = new ProgressBar_1.ProgressBar(response.size, "deleting messages");
            bar.start();
            let i = 1;
            response.forEach(() => {
                bar.update(i);
                i++;
            });
            bar.stop();
        })
            .catch((pastErr) => __awaiter(this, void 0, void 0, function* () {
            Printer_1.Printer.error("Bulk delete failed, switching to manual delete.");
            Printer_1.Printer.warn(pastErr.toString());
            let dog = new DiscordObjectGetter_1.DiscordObjectGetter();
            try {
                yield this.overrideDelete(yield dog.fetch(channel, n, { maxIterations: 5000, allowOverflow: false }));
            }
            catch (e) {
                Printer_1.Printer.error(e.toString());
            }
        }));
    }
    overrideDelete(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            let bar = new ProgressBar_1.ProgressBar(messages.length, "deleting messages");
            bar.start();
            let alive = true;
            let timeout = setTimeout(() => {
                alive = false;
                bar.stop();
                Printer_1.Printer.warn("deleting messages slower than planned, stopping");
            }, 10000);
            for (var i = 0; i < messages.length && alive; i++) {
                if (messages[i].deletable) {
                    yield messages[i].delete({ timeout: 100 });
                }
                bar.update(i + 1);
                timeout.refresh();
            }
            clearTimeout(timeout);
            bar.stop();
            Printer_1.Printer.print("");
        });
    }
    getParams(wrapper) {
        if (wrapper.hasArgs()) {
            let messages = 1;
            if (!Number.isNaN(Number.parseInt(wrapper.get("n")))) {
                messages = Number.parseInt(wrapper.get("n")) + 1;
            }
            let username = undefined;
            if (wrapper.get("u")) {
                let value = wrapper.getValue(["u", "user", "username"]);
                let res = /([A-Za-z0-9]+#+[0-9999])\w+/.exec(value);
                if (res && res[0] == value) {
                    username = wrapper.get("u");
                }
            }
            let channel = this.resolveTextChannel(wrapper);
            let deletePinned = wrapper.hasValue(["pins", "p"]);
            return {
                action: Action.NORMAL,
                messages: messages,
                channel: channel,
                username: username,
                deletePinned: deletePinned
            };
        }
        else {
            if (wrapper.commandContent.match(/([0-9]+,)+([0-9]+)$/)) {
                let ids = wrapper.commandContent.split(',');
                let parsedIds = new Array();
                for (let i = 0; i < ids.length; i++) {
                    if (!Number.isNaN(Number.parseInt(ids[i]))) {
                        parsedIds.push(Number.parseInt(ids[i]));
                    }
                }
                return {
                    action: Action.BY_ID,
                    messages: ids.length,
                    channel: wrapper.message.channel,
                    deletePinned: false,
                    messageIDs: ids
                };
            }
            else if (!Number.isNaN(Number.parseInt(wrapper.commandContent))) {
                let messages = Number.parseInt(wrapper.commandContent) + 1;
                return {
                    action: Action.ARG_LESS,
                    messages: messages,
                    channel: wrapper.message.channel,
                    deletePinned: false
                };
            }
        }
    }
}
exports.DeleteCommand = DeleteCommand;
var Action;
(function (Action) {
    Action[Action["NORMAL"] = 0] = "NORMAL";
    Action[Action["ARG_LESS"] = 1] = "ARG_LESS";
    Action[Action["BY_ID"] = 2] = "BY_ID";
    Action[Action["NOT_DEF"] = 3] = "NOT_DEF";
})(Action || (Action = {}));
//# sourceMappingURL=DeleteCommand.js.map