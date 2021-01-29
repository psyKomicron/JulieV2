import { Bot } from "../bot/discord/Bot";
import { Command } from "../bot/discord/commands/Command";
import { DownloadCommand } from "../bot/discord/commands/commands/DownloadCommand";
import { DeleteCommand } from "../bot/discord/commands/commands/DeleteCommand";
import { EmbedCommand } from "../bot/discord/commands/commands/EmbedCommand";
import { ExploreCommand } from "../bot/discord/commands/commands/ExploreCommand";
import { PlayCommand } from "../bot/discord/commands/commands/PlayCommand";
import { HelpCommand } from "../bot/discord/commands/commands/HelpCommand";
import { TestCommand } from "../bot/discord/commands/commands/TestCommand";
import { VoteCommand } from "../bot/discord/commands/commands/VoteCommand";
import { AddUserCommand } from "../bot/discord/commands/commands/AddUserCommand";
import { ChannelCleanerCommand } from "../bot/discord/commands/commands/ChannelCleanerCommand";
import { ShowUsersCommand } from "../bot/discord/commands/commands/ShowUsersCommand";
import { ChangePrefixCommand } from "../bot/discord/commands/commands/ChangePrefixCommand";
import { DefaultCommand } from "../bot/discord/commands/commands/DefaultCommand";
import { GambleCommand } from "../bot/discord/commands/commands/GambleCommand";
import { CollectCommand } from "../bot/discord/commands/commands/CollectCommand";
import { ArgumentError } from "../errors/ArgumentError";

export class CommandFactory
{
    public static create(type: string, bot: Bot): Command
    {
        let command: Command = undefined;
        switch (type)
        {
            case "dl":
            case "download":
                command = new DownloadCommand(bot);
                break;
            case "d":
            case "delete":
                command = new DeleteCommand(bot);
                break;
            case "embed":
                command = new EmbedCommand(bot);
                break;
            case "search":
            case "e":
            case "explore":
                command = new ExploreCommand(bot);
                break;
            case "p":
            case "play":
                command = new PlayCommand(bot);
                break;
            case "h":
            case "help":
                command = new HelpCommand(bot);
                break;
            case "t":
            case "test":
                command = new TestCommand(bot);
                break;
            case "v":
            case "vote":
                command = new VoteCommand(bot);
                break;
            case "a":
            case "add":
            case "adduser":
                command = new AddUserCommand(bot);
                break;
            case "c":
            case "clean":
                command = new ChannelCleanerCommand(bot);
                break;
            case "su":
            case "showusers":
                command = new ShowUsersCommand(bot);
                break;
            case "changeprefix":
            case "prefix":
                command = new ChangePrefixCommand(bot);
                break;
            case "g":
            case "gamble":
                command = new GambleCommand(bot);
                break;
            case "collect":
                command = new CollectCommand(bot);
                break;
            default:
                command = new DefaultCommand(bot);
                break;
        }
        return command;
    }

    public static exist(commandName: string): boolean
    {
        switch (commandName)
        {
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