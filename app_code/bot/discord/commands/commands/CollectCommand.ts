import { Command } from "../Command";
import { Message, TextChannel } from "discord.js";
import { Bot, CollectOptions } from "../../Bot";
import { Tools } from "../../../../helpers/Tools";
import { CommandError } from "../../../../errors/command_errors/CommandError";
import { ArgumentError } from "../../../../errors/ArgumentError";

/**Asks the TwitterBot to collect images from a channel.*/
export class CollectCommand extends Command
{
    public constructor(bot: Bot)
    {
        super(CollectCommand.name, bot);
    }

    public async execute(message: Message): Promise<void> 
    {
        if (message.channel instanceof TextChannel)
        {
            this.bot.emit("collect", message.channel, true, this.getParams(this.parseMessage(message)));
        }
        else
        {
            this.bot.emit("collect", undefined, false);
        }
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
                    throw new CommandError(
                        this,
                        new ArgumentError("Date parameters could not be parsed from the command message", "date"),
                    );
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
                throw new CommandError(
                    this,
                    new ArgumentError("Date parameters could not be parsed from the command message", "date")
                );
            }
        }
        else
        {
            return new Date(Date.parse(date));
        }
    }

    private getParams(params: Map<string, string>): CollectOptions
    {
        let collectWhen: Date;
        let keepUntil: Date;
        let fetchType: number;

        let when = this.getValue(params, ["when", "w"], false);
        if (!Tools.isNullOrEmpty(when))
        {
            collectWhen = this.parseDate(when);
        }

        let until = this.getValue(params, ["keep-until", "k-u"]);
        if (!Tools.isNullOrEmpty(until))
        {
            keepUntil = this.parseDate(until);
        }

        let fetch = this.getValue(params, ["n", "fetch-type"]);
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