"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandFactory = void 0;
const DownloadCommand_1 = require("../bot/discord/commands/commands/DownloadCommand");
const DeleteCommand_1 = require("../bot/discord/commands/commands/DeleteCommand");
const EmbedCommand_1 = require("../bot/discord/commands/commands/EmbedCommand");
const ExploreCommand_1 = require("../bot/discord/commands/commands/ExploreCommand");
const PlayCommand_1 = require("../bot/discord/commands/commands/PlayCommand");
const HelpCommand_1 = require("../bot/discord/commands/commands/HelpCommand");
const TestCommand_1 = require("../bot/discord/commands/commands/TestCommand");
const VoteCommand_1 = require("../bot/discord/commands/commands/VoteCommand");
const AddUserCommand_1 = require("../bot/discord/commands/commands/AddUserCommand");
const CleanChannelCommand_1 = require("../bot/discord/commands/commands/CleanChannelCommand");
const ShowUsersCommand_1 = require("../bot/discord/commands/commands/ShowUsersCommand");
const ChangePrefixCommand_1 = require("../bot/discord/commands/commands/ChangePrefixCommand");
const DefaultCommand_1 = require("../bot/discord/commands/commands/DefaultCommand");
const GambleCommand_1 = require("../bot/discord/commands/commands/GambleCommand");
const CollectCommand_1 = require("../bot/discord/commands/commands/CollectCommand");
const RemindUserCommand_1 = require("../bot/discord/commands/commands/RemindUserCommand");
class CommandFactory {
    static create(name, bot) {
        switch (name) {
            case "a":
            case "add":
            case "adduser":
                return new AddUserCommand_1.AddUserCommand(bot);
            case "c":
            case "clean":
                return new CleanChannelCommand_1.CleanChannelCommand(bot);
            case "collect":
                return new CollectCommand_1.CollectCommand(bot);
            case "changeprefix":
            case "prefix":
                return new ChangePrefixCommand_1.ChangePrefixCommand(bot);
            case "dl":
            case "download":
                return new DownloadCommand_1.DownloadCommand(bot);
            case "d":
            case "delete":
                return new DeleteCommand_1.DeleteCommand(bot);
            case "embed":
                return new EmbedCommand_1.EmbedCommand(bot);
            case "explore":
            case "search":
            case "e":
                return new ExploreCommand_1.ExploreCommand(bot);
            case "g":
            case "gamble":
                return new GambleCommand_1.GambleCommand(bot);
            case "h":
            case "help":
                return new HelpCommand_1.HelpCommand(bot);
            case "remind":
                return new RemindUserCommand_1.RemindUserCommand(bot);
            case "su":
            case "showusers":
                return new ShowUsersCommand_1.ShowUsersCommand(bot);
            case "p":
            case "play":
                return new PlayCommand_1.PlayCommand(bot);
            case "t":
            case "test":
                return new TestCommand_1.TestCommand(bot);
            case "v":
            case "vote":
                return new VoteCommand_1.VoteCommand(bot);
            default:
                return new DefaultCommand_1.DefaultCommand(bot);
        }
    }
    static exist(commandName) {
        switch (commandName) {
            case "dl":
            case "download":
                return true;
            case "d":
            case "delete":
                return true;
            case "embed":
                return true;
            case "search":
            case "e":
            case "explore":
                return true;
            case "p":
            case "play":
                return true;
            case "h":
            case "help":
                return true;
            case "t":
            case "test":
                return true;
            case "v":
            case "vote":
                return true;
            case "a":
            case "add":
            case "adduser":
                return true;
            case "c":
            case "clean":
                return true;
            case "su":
            case "showusers":
                return true;
            case "changeprefix":
            case "prefix":
                return true;
            case "g":
            case "gamble":
                return true;
            case "collect":
                return true;
            default:
                return false;
        }
    }
}
exports.CommandFactory = CommandFactory;
//# sourceMappingURL=CommandFactory.js.map