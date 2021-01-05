import { Bot } from "../discord/Bot";
import { Message } from "discord.js";

export class TwitterBot
{
    public constructor(bot: Bot)
    {
        bot.on("collect", message => { this.onCollect(message); });
    }

    private onCollect(message: Message): void
    {

    }
}