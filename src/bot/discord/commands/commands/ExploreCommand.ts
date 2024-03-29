import { Bot } from "../../Bot";
import { Printer } from "../../../../console/Printer";
import { YTExplorer } from "../../command_modules/YoutubeExplorer";
import { WikiExplorer } from "../../command_modules/WikiExplorer";
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { CommandSyntaxError } from "../../../../errors/command_errors/CommandSyntaxError";
import { Command } from "../Command";
import { Explorer } from "../../command_modules/Explorer";
import { MessageWrapper } from "../../../common/MessageWrapper";

export class ExploreCommand extends Command
{
    private wrapper: MessageWrapper;

    public constructor(bot: Bot)
    {
        super("explore", bot, false);
    }

    public async execute(wrapper: MessageWrapper): Promise<void>
    {
        this.wrapper = wrapper;
        let params: Params = this.getParams(wrapper);
        let keyword = params.keyword;
        let domain = params.domain;

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

        wrapper.delete(1000);
    }

    /**
     * Sends a message to the command message's channel
     * @param embed
     */
    public send(embed: MessageEmbed): void
    {
        this.wrapper.sendToChannel(embed);
    }

    private getParams(wrapper: MessageWrapper): Params
    {
        let keyword: string = undefined;
        let domain: Domain = undefined;

        if (wrapper.hasValue(["k", "keyword"]))
        {
            keyword = wrapper.getValue(["k", "keyword"]);
        }

        if (wrapper.hasValue(["yt", "youtube"]))
        {
            domain = Domain.YOUTUBE;
        }

        if (wrapper.hasValue(["w", "wiki"]))
        {
            if (!domain)
            {
                throw new CommandSyntaxError(this, "Duplicate domain name use. You can set the search to be on Youtube or Wikipedia but not both");
            }
            else
            {
                domain = Domain.WIKIPEDIA;
            }
        }

        return { keyword, domain };
    }
}

enum Domain
{
    YOUTUBE = "youtube",
    WIKIPEDIA = "wikipedia"
}

interface Params
{
    keyword: string;
    domain: Domain;
}