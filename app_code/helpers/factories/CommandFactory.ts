import { Bot } from "../../bot/Bot";
import { Command } from "../../bot/commands/Command";
import { DownloadCommand } from "../../bot/commands/commands/DownloadCommand";
import { DeleteCommand } from "../../bot/commands/commands/DeleteCommand";
import { EmbedCommand } from "../../bot/commands/commands/EmbedCommand";
import { ExploreCommand } from "../../bot/commands/commands/ExploreCommand";
import { PlayCommand } from "../../bot/commands/commands/PlayCommand";
import { HelpCommand } from "../../bot/commands/commands/HelpCommand";
import { ReplyCommand } from "../../bot/commands/commands/ReplyCommand";
import { TestCommand } from "../../bot/commands/commands/TestCommand";
import { VoteCommand } from "../../bot/commands/commands/VoteCommand";
import { DefaultCommand } from "../../bot/commands/commands/DefaultCommand";
import { AddUserCommand } from "../../bot/commands/commands/AddUserCommand";
import { ChannelCleanerCommand } from "../../bot/commands/commands/ChannelCleanerCommand";
import { ShowUsersCommand } from "../../bot/commands/commands/ShowUsersCommand";
import { ChangePrefixCommand } from "../../bot/commands/commands/ChangePrefixCommand";

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
            case "r":
            case "reply":
                command = new ReplyCommand(bot);
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
            default:
                command = new DefaultCommand(bot);
                break;
        }
        return command;
    }
}