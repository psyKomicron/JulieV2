import { GuildMember, User } from "discord.js";
import { Printer } from "../../../../console/Printer";
import { Config } from "../../../../dal/Config";
import { CommandSyntaxError } from "../../../../errors/command_errors/CommandSyntaxError";
import { Tools } from "../../../../helpers/Tools";
import { Alarm } from "../../../common/Alarm";
import { MessageWrapper } from "../../../common/MessageWrapper";
import { Bot } from "../../Bot";
import { Command } from "../Command";

/**
 * @name remind
 * @example /remind psyKomicron,10,good job !
 */
export class RemindUserCommand extends Command 
{
    public constructor(bot: Bot)
    {
        super(RemindUserCommand.name, bot);
    }

    public async execute(wrapper: MessageWrapper): Promise<void>
    {
        let params = await this.getParams(wrapper);
        Printer.args(["user", "date", "message"], [params.user?.tag, params.date?.toUTCString(), params.message]);

        if (params.user && params.date)
        {
            let alarm = new Alarm(params.date, "reminding user " + params.user.tag);
            let user = params.user;
            let message = params.message;
            alarm.on("reachedEnd", () => 
            {
                wrapper.sendToChannel("<@" + user.id + ">, " + message + "\nfrom <@" + wrapper.message.author.id + ">");
            });
            alarm.start();
        }
    }

    public help(wrapper: MessageWrapper): string
    {
        let arg = wrapper.commandContent;
        if (!Tools.isNullOrEmpty(arg))
        {
            let message = "";
            switch (arg)
            {
                case "u":
                    case "user":
                        message = "User to remind something to. The user will be pinged."
                        break;
                case "d":
                    case "t":
                        case "date":
                            message = "When to send the message from now in minutes. For example [...] -d 5 will remind the user with the message in 5 minutes.";
                        break;
                case "m":
                    case "message":
                        case "mess":
                            message = "Message to send the user. Remember to be nice :)";
                        break;
                default:
                    message = "Unknown option used, look at the help page for the RemindUser command for the list of options."
                    break;
            }
            return message;
        }
        else 
        {
            return "When using the command without options you need to respect the following syntax: `" + Config.getPrefix() + "remind username@tag,[number]`\n`[number]` is a numerical string of characters (i.e. 12). When you use the command, do not add spaces around commas the command will fail if you do so. You do not need to add a message for the command. If you want to add one use the following syntax: `remind username@tag,[number],[message]`";
        }
    }

    private async getParams(wrapper: MessageWrapper): Promise<Params>
    {
        let params: Params = {date: undefined, user: undefined, message: undefined};
        if (wrapper.hasArgs())
        {
            if (wrapper.hasValue(["u", "user"]))
            {
                let username = wrapper.getValue(["u", "user"]);
                let member: GuildMember = await wrapper.fetchMember(username);
                if (member != undefined)
                {
                    params.user = member.user;
                }
            }
            if (wrapper.hasValue(["d", "date", "t"]))
            {
                let date = wrapper.getValue(["d", "date"]);
                let now = new Date(Date.now());
                if (!Number.isNaN(Number.parseInt(date)))
                {
                    now.setMinutes(now.getMinutes() + Number.parseInt(date));
                    params.date = now;
                }
            }
            if (wrapper.hasValue(["m", "message", "mess"]))
            {
                params.message = wrapper.getValue(["m", "message", "mess"]);
            }
            
        }
        else 
        {
            let args = wrapper.commandContent.split(",");

            if (args.length >= 2)
            {
                let username = args[0];
                let member: GuildMember = await wrapper.fetchMember(username);
                if (member != undefined)
                {
                    params.user = member.user;
                }

                let when = args[1];
                if (!Number.isNaN(Number.parseInt(when)))
                {
                    let now = new Date(Date.now());
                    now.setMinutes(now.getMinutes() + Number.parseInt(when));
                    params.date = now;
                }

                params.message = wrapper.commandContent.substring(args[0].length + args[1].length + 2);
            }
            else 
            {
                throw new CommandSyntaxError(this, "Unable to get the user and date (message is optional) from your message. \nIf you are not using the command with tac parameters (-u/user -d/date) separate the values with commas. Look the help page for more information.")
            }
        }
        return params;
    }
}

interface Params 
{
    date: Date;
    user: User;
    message: string;
}