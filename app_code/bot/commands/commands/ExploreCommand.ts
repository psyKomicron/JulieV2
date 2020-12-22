import { Bot } from "../../Bot";
import { Printer } from "../../../console/Printer";
import { Command } from "../Command";
import { YTExplorer } from "../../command_modules/explore/YoutubeExplorer";
import { WikiExplorer } from "../../command_modules/explore/WikiExplorer";
import { Explorer } from "../../command_modules/explore/Explorer";
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { CommandSyntaxError } from "../../../errors/command_errors/CommandSyntaxError";

export class ExploreCommand extends Command
{
    private channel: TextChannel;

    public constructor(bot: Bot)
    {
        super("explore", bot);
    }

    public async execute(message: Message): Promise<void>
    {
        let params: [string, Domain] = this.getParams(this.parseMessage(message));
        let keyword = params[0];
        let domain = params[1];

        Printer.title("explorer");
        Printer.args(["keyword", "domain name"], [`${keyword}`, `${domain}`]);

        let e: Explorer;
        switch (domain)
        {
            case Domain.YOUTUBE:
                e = new YTExplorer(keyword, this);
                break;
            case Domain.WIKIPEDIA:
                e = new WikiExplorer(keyword, this);
                break;
        }
        e.explore();

        this.deleteMessage(message, 1000);
    }

    /**
     * Sends a message to the command message's channel
     * @param embed
     */
    public send(embed: MessageEmbed): Promise<Message>
    {
        return this.channel.send(embed);
    }

    private getParams(args: Map<string, string>): [string, Domain]
    {
        let keyword: string = undefined;
        let domain: Domain = Domain.YOUTUBE;

        args.forEach((v, k) =>
        {
            switch (k)
            {
                case "k":
                case "keyword":
                    keyword = v;
                    break;
                case "yt":
                case "youtube":
                    domain = Domain.YOUTUBE;
                    break;
                case "w":
                case "wiki":
                    domain = Domain.WIKIPEDIA;
                    break;
                default:
                    throw new CommandSyntaxError(this);
            }
        });
        return [keyword, domain];
    }
}

enum Domain
{
    YOUTUBE = "youtube",
    WIKIPEDIA = "wikipedia"
}