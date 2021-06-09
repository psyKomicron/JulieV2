import { Logger } from "../Logger";
import { Message } from "discord.js";
import { Printer } from "../../../../../console/Printer";
import { EmojiReader } from "../../../../../dal/readers/EmojiReader";
import { VoteCommand } from "../../../commands/commands/VoteCommand";
import { MessageWrapper } from "../../../../common/MessageWrapper";

export class VoteLogger extends Logger
{
    private vote: VoteCommand;
    private voteID: number;

    public constructor()
    {
        super("vote-logger");
    }

    public handle(message: MessageWrapper): boolean 
    {
        let can: boolean;
        // change to allow for prefix change
        if (message.content.substr(1, 3) == "end" && this.isID(message.content))
        {
            can = true;
            this.work(message);
            Printer.title("handled by vote logger");
        }
        else
        {
            if (this.next)
            {
                can = this.next.handle(message);
            }
            else
            {
                can = false;
            }
        }
        return can;
    }

    protected async work(message: MessageWrapper): Promise<void>
    {
        let content = message.content;
        let index = content.split(" ")[1];
        if (!Number.isNaN(Number.parseInt(index)))
        {
            try 
            {
                this.end(Number.parseInt(index));
            } catch (error) 
            {
                if (error instanceof RangeError)
                {
                    message.react(EmojiReader.getEmoji("red_cross"));
                    Printer.error(error.toString());
                }
            }
        }
        message.delete(5000);
    }

    public logVote(vote: VoteCommand): number
    {
        let id = this.hash(vote.title);
        this.vote = vote;
        this.voteID = id;
        this.logCommand(vote);
        return id;
    }

    private isID(content: string): boolean
    {
        let index = content.split(" ")[1];
        if (!Number.isNaN(Number.parseInt(index)))
        {
            let value: number;
            try 
            {
                value = Number.parseInt(index);
                if (value)
                {
                    return value == this.voteID;
                }
            } catch (error) 
            {
                return false;
            }
        }
        return false;
    }

    /**
     * Ends the vote whose id match the key given.
     * @throws If the @key does not match with a vote
     * @param key Id of a vote
     */
    private end(key: number): void
    {
        if (key == this.voteID)
        {
            this.vote.end("User input");
        }
        else
        {
            throw new RangeError("Key not matching");
        }
    }

    /**
     * Hash a string using sdbm hash algorithm
     * @param value Value to hash
     */
    private hash(value: string): number
    {
        let hashAddr = 0;
        for (let counter = 0; counter < value.length; counter++)
        {
            hashAddr = value.charCodeAt(counter) + (hashAddr << 6) + (hashAddr << 16) - hashAddr;
        }
        return hashAddr;
    }
}