import { Logger } from "../Logger";
import { Message } from "discord.js";
import { MessageWrapper } from "../../../../common/MessageWrapper";

export class DefaultLogger extends Logger
{
    public constructor()
    {
        super("default-logger");
    }

    public handle(message: MessageWrapper): boolean 
    {
        if (this.next)
        {
            return this.next.handle(message);
        }
        else
        {
            return false;
        }
    }

    public async work(message: MessageWrapper): Promise<void>
    {
        throw new Error("Cannot be called on default logger");
    }
}