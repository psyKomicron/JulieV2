import { Bot } from "../../Bot";
import { Printer } from "../../../../console/Printer";
import { YTExplorer } from "../../command_modules/YoutubeExplorer";
import { WikiExplorer } from "../../command_modules/WikiExplorer";
import { MessageEmbed } from 'discord.js';
import { CommandSyntaxError } from "../../../../errors/command_errors/CommandSyntaxError";
import { Command } from "../Command";
import { Explorer } from "../../command_modules/Explorer";
import { MessageWrapper } from "../../../common/MessageWrapper";

export class ExploreCommand extends Command
{
    private wrapper: MessageWrapper;

    public constructor(bot: Bot)
    {
        super("explore", bot);
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
            case Domain.Youtube:
                e = new YTExplorer(keyword, this);
                break;
            case Domain.Wikipedia:
                e = new WikiExplorer(keyword, this);
                break;
        }
        e.explore();
    }

    public help(wrapper: MessageWrapper): string
    {
        let option = wrapper.commandContent;
        if (option)
        {
            let message = "";
            switch (option)
            {
                case "k":
                    case "keyword":
                        break;
                case "yt":
                    case "youtube":
                        break;
                case "wiki":
                    case "wikipedia":
                        break;
                default:
                    message = "Unknow option, look the help page for this command to get a list of options.";
                    break;
            }
            return message;
        }
        else 
        {
            return "ExploreCommand cannot be used without arguments (options).";
        }
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
            domain = Domain.Youtube;
        }

        if (wrapper.hasValue(["w", "wiki"]))
        {
            if (!domain)
            {
                throw new CommandSyntaxError(this, "Duplicate domain name use. You can set the search to be on Youtube or Wikipedia but not both.");
            }
            else
            {
                domain = Domain.Wikipedia;
            }
        }

        return { keyword, domain };
    }
}

enum Domain
{
    Youtube = "youtube",
    Wikipedia = "wikipedia"
}

interface Params
{
    keyword: string;
    domain: Domain;
}