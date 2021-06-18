import { Command } from "../Command";
import { Message, TextChannel } from "discord.js";
import { Bot, CollectOptions } from "../../Bot";
import { Tools } from "../../../../helpers/Tools";
import { CommandError } from "../../../../errors/command_errors/CommandError";
import { ArgumentError } from "../../../../errors/ArgumentError";
import { MessageWrapper } from "../../../common/MessageWrapper";
import { CommandArgumentError } from "../../../../errors/command_errors/CommandArgumentError";
import { NotImplementedError } from "../../../../errors/NotImplementedError";

/**Asks the TwitterBot to collect images from a channel.*/
export class CollectCommand extends Command
{
    public constructor(bot: Bot)
    {
        super(CollectCommand.name, bot);
    }

    public async execute(wrapper: MessageWrapper): Promise<void> 
    {
        if (wrapper.message.channel instanceof TextChannel)
        {
            this.bot.emit("collect", wrapper.message.channel, true, this.getParams(wrapper));
        }
        else
        {
            this.bot.emit("collect", undefined, false);
        }
    }

    public help(wrapper: MessageWrapper): string
    {
        throw new NotImplementedError();
    }

    private parseDate(date: string): Date
    {
        if (Number.isNaN(Date.parse(date)))
        {
            if (Tools.isDate(date))
            {
                let numbers = date.split(":");
                if (Number.isNaN(Number.parseInt(numbers[0])) || Number.isNaN(Number.parseInt(numbers[1])))
                {
                    throw new CommandArgumentError(this, "Date parameters could not be parsed from the command message", "date");
                }
                else
                {
                    let h = Number.parseInt(numbers[0]);
                    let m = Number.parseInt(numbers[1]);
                    let now = new Date(Date.now());

                    now.setHours(h);
                    now.setMinutes(m);
                    now.setSeconds(0);
                    now.setMilliseconds(0);
                    return now;
                }
            }
            else
            {
                throw new CommandArgumentError(this, "Date is invalid", "date");
            }
        }
        else
        {
            return new Date(Date.parse(date));
        }
    }

    private getParams(wrapper: MessageWrapper): CollectOptions
    {
        let collectWhen: Date;
        let keepUntil: Date;
        let fetchType: number;

        let when = wrapper.getValue(["when", "w"], false);
        if (!Tools.isNullOrEmpty(when))
        {
            collectWhen = this.parseDate(when);
        }

        let until = wrapper.getValue(["keep-until", "k-u"]);
        if (!Tools.isNullOrEmpty(until))
        {
            keepUntil = this.parseDate(until);
        }

        let fetch = wrapper.getValue(["n", "fetch-type"]);
        if (!Tools.isNullOrEmpty(fetch))
        {
            if (!Number.isNaN(Number.parseInt(fetch)))
            {
                fetchType = Number.parseInt(fetch);
            }
            else
            {
                throw new ArgumentError("Fetch type is invalid", "-n or -fetch-type");
            }
        }

        return { collectWhen: collectWhen, keepUntil: keepUntil, fetchType: fetchType };
    }
}