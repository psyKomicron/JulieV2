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
exports.VoteCommand = void 0;
const Command_1 = require("../Command");
const discord_js_1 = require("discord.js");
const VoteLogger_1 = require("../../command_modules/logger/loggers/VoteLogger");
const Printer_1 = require("../../../../console/Printer");
const EmojiReader_1 = require("../../../../dal/readers/EmojiReader");
const CommandError_1 = require("../../../../errors/command_errors/CommandError");
const CommandSyntaxError_1 = require("../../../../errors/command_errors/CommandSyntaxError");
class VoteCommand extends Command_1.Command {
    constructor(bot) {
        super(VoteCommand.name, bot);
        this.votes = new Map();
        this.reactions = new Map();
    }
    get title() {
        return this.params.title;
    }
    execute(message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.params = this.getParams(message);
            Printer_1.Printer.title("starting vote");
            Printer_1.Printer.args(["timeout", "vote reason", "vote channel id", "holding message (id)"], [`${this.params.timeout}`, this.params.title, (_a = this.params.channel) === null || _a === void 0 ? void 0 : _a.id, `${this.params.hostMessageID}`]);
            if (this.params.channel) {
                let logger = new VoteLogger_1.VoteLogger();
                let id = logger.logVote(this);
                this.bot.logger.addLogger(logger);
                let voteTime = "";
                if (this.params.timeout == undefined) {
                    voteTime = "no limit";
                }
                else {
                    voteTime = `${this.params.timeout / 1000} seconds`;
                }
                if (this.params.hostMessageID) {
                    this.usingEmbed = true;
                    yield this.attachVoteToEmbed(this.params.channel, this.params.hostMessageID, this.params.emojis);
                }
                else {
                    yield this.createVoteEmbed(voteTime, id, this.params.channel, this.params.emojis);
                }
                if (this.voteMessage.author.tag == this.bot.client.user.tag) {
                    this.collector = this.createReactionCollector(this.params.timeout, this.params.emojis);
                }
                else {
                    throw new CommandSyntaxError_1.CommandSyntaxError(this);
                }
            }
        });
    }
    end(reason) {
        if (this.collector) {
            this.collector.stop(reason);
        }
    }
    createReactionCollector(timeout, emojis) {
        let filter = (reaction, user) => !user.bot;
        var collector = this.voteMessage.createReactionCollector(filter, { time: timeout, dispose: true });
        collector.on("collect", (reaction, user) => this.onCollectorCollect(reaction, user));
        collector.on("remove", (reaction, user) => this.onCollectorRemove(reaction, user));
        collector.on("end", () => this.onCollectorEnd());
        emojis.forEach(emoji => {
            this.voteMessage.react(emoji.name)
                .catch((e) => {
                Printer_1.Printer.warn("Could not react to vote message for emoji : " + emoji.name);
                Printer_1.Printer.error(e);
            });
        });
        return collector;
    }
    createVoteEmbed(voteTime, id, channel, emojis) {
        return __awaiter(this, void 0, void 0, function* () {
            this.messageEmbed = new discord_js_1.MessageEmbed()
                .setTitle(this.title)
                .addField("Time limit", voteTime)
                .setFooter("Vote id : " + id);
            this.voteMessage = yield channel.send(this.messageEmbed);
            try {
                let greenCheck = EmojiReader_1.EmojiReader.getEmoji("green_check").value;
                let greenCross = EmojiReader_1.EmojiReader.getEmoji("green_cross").value;
                emojis.push(new discord_js_1.Emoji(this.bot.client, { name: greenCheck }));
                emojis.push(new discord_js_1.Emoji(this.bot.client, { name: greenCross }));
            }
            catch (error) {
                throw new CommandError_1.CommandError(this, "Uh oh something broke... A technician will fix this, give it little bit of time and try again !", error);
            }
        });
    }
    attachVoteToEmbed(channel, hostMessageID, emojis) {
        return __awaiter(this, void 0, void 0, function* () {
            let hostMessage = yield channel.messages.fetch(hostMessageID);
            if (hostMessage.embeds.length > 0) {
                this.messageEmbed = hostMessage.embeds[0];
                this.messageEmbed.fields.forEach(field => {
                    let emoji = undefined;
                    try {
                        emoji = new discord_js_1.Emoji(this.bot.client, { name: field.name });
                    }
                    catch (e) {
                        try {
                            emoji = new discord_js_1.Emoji(this.bot.client, { name: field.value });
                        }
                        catch (e) { }
                    }
                    if (emoji) {
                        emojis.push(emoji);
                    }
                });
            }
            else {
                throw new CommandSyntaxError_1.CommandSyntaxError(this, "Message to use as vote message was not an embed, it cannot be used for the vote.");
            }
            this.voteMessage = hostMessage;
        });
    }
    onCollectorCollect(reaction, user) {
        this.votes.set(user, reaction);
        if (this.reactions.has(reaction)) {
            this.reactions.get(reaction).push(user);
        }
        else {
            this.reactions.set(reaction, new Array());
            this.reactions.get(reaction).push(user);
        }
    }
    onCollectorRemove(reaction, user) {
        this.votes.delete(user);
        let users = this.reactions.get(reaction);
        let newUsers = new Array();
        users.forEach(value => {
            if (value.tag != user.tag) {
                newUsers.push(value);
            }
        });
        this.reactions.set(reaction, newUsers);
    }
    onCollectorEnd() {
        this.emit("end");
        this.voteMessage.edit("**Vote ended !**");
        let embed = new discord_js_1.MessageEmbed()
            .setColor(this.messageEmbed.color)
            .setTitle("Results for " + this.messageEmbed.title);
        if (this.usingEmbed) {
            this.messageEmbed.fields.forEach(field => {
                embed.addField(field.name, field.value, true);
            });
        }
        this.reactions.forEach((users, reaction) => {
            let emoji = reaction.emoji.name;
            let votes = "";
            if (this.params.displayUsers) {
                users.forEach(user => {
                    votes += `<@${user.id}>, `;
                });
            }
            else {
                votes += users.length;
            }
            embed.addField(emoji, votes, true);
        });
        this.voteMessage.edit(embed);
        this.voteMessage.reactions.removeAll();
        this.voteMessage.pin();
    }
    getParams(wrapper) {
        let timeout = 60000;
        let title = "Yes/No";
        let channel;
        let hostMessageID;
        let emojis = new Array();
        let displayUsers = false;
        channel = this.resolveTextChannel(wrapper);
        if (wrapper.hasArgs()) {
            let newTitle = wrapper.getValue(["r", "title"]);
            if (newTitle != "") {
                title = newTitle;
            }
            if (!Number.isNaN(Number.parseInt(wrapper.getValue(["timeout", "n"])))) {
                timeout = Number.parseInt(wrapper.getValue(["timeout", "n"]));
            }
            else if (wrapper.getValue(["timeout", "n"]) == "nolimit") {
                timeout = undefined;
            }
            let value = wrapper.getValue(["m", "message"]);
            let desconstructedSnowflake = discord_js_1.SnowflakeUtil.deconstruct(value);
            if (desconstructedSnowflake) {
                hostMessageID = value;
            }
            if (wrapper.hasValue(["reactions", "e"])) {
                let names = wrapper.getValue(["reaction", "e"]).split(" ");
                names.forEach(emoji => {
                    try {
                        emojis.push(new discord_js_1.Emoji(this.bot.client, emoji));
                    }
                    catch (error) { }
                });
            }
            if (wrapper.has("displayusers")) {
                if (wrapper.get("displayusers")) {
                    if (wrapper.get("displayusers").match(/[y]|[yes]|[true]/gi)) {
                        displayUsers = true;
                    }
                }
                else {
                    displayUsers = true;
                }
            }
        }
        else {
            title = wrapper.commandContent;
        }
        return { timeout, title, channel, hostMessageID, emojis, displayUsers };
    }
}
exports.VoteCommand = VoteCommand;
//# sourceMappingURL=VoteCommand.js.map