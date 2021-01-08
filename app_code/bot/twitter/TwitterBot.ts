import { Bot } from "../discord/Bot";
import { Message, TextChannel } from "discord.js";
import { DiscordMessageFetcher } from "../common/DiscordMessageFetcher";
import { Downloader } from "../discord/command_modules/Downloader";
import { Printer } from "../../console/Printer";
import { Tools } from "../../helpers/Tools";

export class TwitterBot
{
    private static instance: TwitterBot;
    private collecting: boolean = false;

    private constructor(bot: Bot)
    {
        bot.on("collect", channel =>
        {
            this.onCollect(channel);
        });

        bot.on("ready", () =>
        {
            Printer.info("Twitter bot : ready");
        });
    }

    /**
     * Singleton constructor
     * @param bot Discord bot to subscribe to for events
     */
    public static get(bot: Bot): TwitterBot
    {
        if (!this.instance)
        {
            this.instance = new TwitterBot(bot);
        }
        return this.instance;
    }

    private async onCollect(channel: TextChannel): Promise<void>
    {
        if (this.collecting && !channel)
        {
            return;
        }

        let dog = new DiscordMessageFetcher();
        let messages: Array<Message> = await dog.fetchToday(channel);
        //let downloader: Downloader = new Downloader(channel.name);

        // get links
        let urls: Array<string> = new Array();
        messages.forEach((message: Message) =>
        {
            if (message.attachments.size > 0)
            {
                message.attachments.forEach(attachement =>
                {
                    urls.push(attachement.url);
                });
            }
            else
            {
                let content = message.content;
                let urls = content.match(Tools.getUrlRegex());
                if (urls != undefined)
                {
                    for (var i = 0; i < urls.length; i++)
                    {
                        urls.push(urls[i]);
                    }
                }
            }
        })

        Printer.print("Retreived urls : ");
        urls.forEach(url => Printer.print("\t" + url));

        //downloader.download()

        this.collecting = false;
    }
}