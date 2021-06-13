import { GuildMember, User } from "discord.js";
import { Printer } from "../../../../console/Printer";
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
                let now = new Date(Date.now());
                if (!Number.isNaN(Number.parseInt(when)))
                {
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