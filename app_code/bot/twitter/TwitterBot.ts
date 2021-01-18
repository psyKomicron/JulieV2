import { Bot, CollectOptions } from "../discord/Bot";
import { Message, TextChannel } from "discord.js";
import { DiscordMessageFetcher } from "../common/DiscordMessageFetcher";
import { Downloader } from "../discord/command_modules/Downloader";
import { Printer } from "../../console/Printer";
import { Tools } from "../../helpers/Tools";
import { Alarm } from "./Alarm";

export class TwitterBot
{
    private static instance: TwitterBot;
    private collecting: boolean = false;
    private collectChannel: TextChannel;
    private alarm: Alarm;
    private fetchMethod: number;

    private constructor(bot: Bot)
    {
        bot.on("collect", (channel: TextChannel, setAsDefault: boolean, options: CollectOptions) =>
        {
            this.onCollect(channel, setAsDefault, options);
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

    private onCollect(channel: TextChannel, setAsDefault: boolean, options: CollectOptions): void
    {
        if (setAsDefault) // setAsDefault: will be collecting at intervals in this channel pics
        {
            this.collectChannel = channel;

            if (options)
            {
                if (options.collectWhen) // when to collect (00:00)
                {
                    this.alarm = new Alarm(options.collectWhen);
                }
                if (options.keepUntil)
                {

                }
                this.fetchMethod = options.fetchType >= 0 ? options.fetchType : 0;
            }
            else
            {
                let now: Date = new Date(Date.now());
                // setting alarm for midnight
                this.alarm = new Alarm(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0));
            }

            if (this.alarm)
            {
                this.alarm.on("reachedEnd", () =>
                {
                    if (this.collectChannel)
                    {
                        this.collect(this.collectChannel, true);
                    }

                }).start();
            }
        }
        else // simple collect, no interval or anything else
        {
            this.collect(channel);
        }
    }

    private async collect(channel: TextChannel, fromAlarm: boolean = false): Promise<void>
    {
        if (this.collecting && !channel)
        {
            return;
        }

        let dog = new DiscordMessageFetcher();
        let messages: Array<Message> = undefined;
        if (this.fetchMethod == 0)
        {
            messages = await dog.fetchToday(channel);
        }
        else
        {

        }

        var filter = (message: Message) =>
        {
            if (message.attachments.size > 0) return true;
            else return Tools.isUrl(message.cleanContent);
        };
        //let messages = await dog.fetchAndFilter(channel, 10, filter, 10, false);

        let downloader: Downloader = new Downloader(channel.name);

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
                let match = content.match(Tools.getUrlRegex());
                if (match != null)
                {
                    for (var i = 0; i < match.length; i++)
                    {
                        urls.push(match[i]);
                    }
                }
            }
        })

        Printer.print("Retreived " + urls.length + " urls : ");
        urls.forEach(url => Printer.print("\t" + url));

        await downloader.download(urls);

        this.collecting = false;
        if (fromAlarm)
        {
            // restarting alarm since channel was collected
            this.alarm.restart();
        }
    }
}