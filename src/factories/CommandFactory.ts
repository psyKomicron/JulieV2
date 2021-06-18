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
import { CleanChannelCommand } from "../bot/discord/commands/commands/CleanChannelCommand";
import { ShowUsersCommand } from "../bot/discord/commands/commands/ShowUsersCommand";
import { ChangePrefixCommand } from "../bot/discord/commands/commands/ChangePrefixCommand";
import { DefaultCommand } from "../bot/discord/commands/commands/DefaultCommand";
import { GambleCommand } from "../bot/discord/commands/commands/GambleCommand";
import { CollectCommand } from "../bot/discord/commands/commands/CollectCommand";
import { RemindUserCommand } from "../bot/discord/commands/commands/RemindUserCommand";

export class CommandFactory
{
    public static create(name: string, bot: Bot): Command
    {
        switch (name)
        {
            case "a":
                case "add":
                    case "adduser":
                        return new AddUserCommand(bot);
            case "c":
                case "clean":
                    return new CleanChannelCommand(bot);
            case "collect":
                return new CollectCommand(bot);
            case "changeprefix":
                case "prefix":
                    return new ChangePrefixCommand(bot);
            case "dl":
                case "download":
                    return new DownloadCommand(bot);
            case "d":
                case "delete":
                    return new DeleteCommand(bot);
            case "embed":
                return new EmbedCommand(bot);
            case "explore":
                case "search":
                    case "e":
                        return new ExploreCommand(bot);
            case "g":
                case "gamble":
                    return new GambleCommand(bot);
            case "h":
                case "help":
                    return new HelpCommand(bot);
            case "remind":
                return new RemindUserCommand(bot);
            case "su":
                case "showusers":
                    return new ShowUsersCommand(bot);
            case "p":
                case "play":
                    return new PlayCommand(bot);
            case "t":
                case "test":
                    return new TestCommand(bot);
            case "v":
                case "vote":
                    return new VoteCommand(bot);
            default:
                return new DefaultCommand(bot);
        }
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