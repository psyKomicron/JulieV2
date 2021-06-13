import { Bot, CollectOptions } from "../discord/Bot";
import { Message, TextChannel } from "discord.js";
import { DiscordObjectGetter } from "../common/DiscordObjectGetter";
import { Downloader } from "../discord/command_modules/Downloader";
import { Printer } from "../../console/Printer";
import { Tools } from "../../helpers/Tools";
import { Alarm } from "../common/Alarm";

export class TwitterBot
{
    private static instance: TwitterBot;

    private dog: DiscordObjectGetter = new DiscordObjectGetter();
    private collecting: boolean = false;
    private collectChannel: TextChannel;
    private collectAlarm: Alarm;
    private keepUntilAlarm: Alarm;
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

    private async collect(channel: TextChannel, fromAlarm: boolean = false): Promise<void>
    {
        if (this.collecting || !channel)
        {
            return;
        }

        let messages: Array<Message> = undefined;
        if (this.fetchMethod == 0)
        {
            messages = await this.dog.fetchToday(channel);
        }
        else
        {
            var filter = (message: Message) =>
            {
                if (message.attachments.size > 0) return true;
                else return Tools.isUrl(message.cleanContent);
            };

            messages = await this.dog.fetchAndFilter(channel, 50, filter, {maxIterations: 200, allowOverflow: false, chunk: Tools.sigmoid });
        }
    
        let downloader: Downloader = new Downloader(channel.name);

        this.collecting = false;

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

        if (fromAlarm)
        {
            // restarting alarm since channel was collected
            this.collectAlarm.restart();
        }
    }

    private setCollectAlarm(alarm: Alarm): void
    {
        if (!this.collectAlarm)
        {
            this.collectAlarm = alarm;
        }
        else
        {
            this.collectAlarm.stop();
            this.collectAlarm = alarm;
        }
    }

    private setKeepUntilAlarm(alarm: Alarm): void
    {
        if (!this.keepUntilAlarm)
        {
            this.keepUntilAlarm = alarm;
        }
        else
        {
            this.keepUntilAlarm.stop();
            this.keepUntilAlarm = alarm;
        }
    }

    //#region events
    private onCollect(channel: TextChannel, setAsDefault: boolean, options: CollectOptions): void
    {
        if (setAsDefault) // setAsDefault: will be collecting at intervals in this channel pics
        {
            this.collectChannel = channel;

            if (options)
            {
                if (options.collectWhen) // when to collect
                {
                    // check date validity
                    if (options.collectWhen.getTime() < Date.now())
                    {
                        options.collectWhen.setDate(options.collectWhen.getDate() + 1);
                    }

                    this.setCollectAlarm(new Alarm(options.collectWhen));
                }
                if (options.keepUntil) // if set, will collect memes in this channel until a given date
                {
                    this.setKeepUntilAlarm(new Alarm(options.keepUntil, "keep-until alarm", false));

                    this.keepUntilAlarm.on("reachedEnd", name =>
                    {
                        Printer.info(name);
                        while (this.collecting);
                        this.collectChannel = undefined;
                    });
                }
                this.fetchMethod = options.fetchType >= 0 ? options.fetchType : 0;
            }
            else
            {
                let now: Date = new Date(Date.now());
                // setting alarm for midnight
                this.setCollectAlarm(new Alarm(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)));
            }

            if (this.collectAlarm)
            {
                this.collectAlarm.on("reachedEnd", () =>
                {
                    this.collect(this.collectChannel, true);
                }).start();
            }
        }
        else // simple collect, no interval or anything else
        {
            this.collect(channel);
        }
    }
    //#endregion
}