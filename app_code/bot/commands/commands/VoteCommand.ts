import { Bot } from '../../Bot';
import { Command } from '../Command';
import
{
    Message, MessageReaction, MessageEmbed,
    User,
    ReactionCollector,
    Snowflake, SnowflakeUtil,
    Emoji,
    Channel, TextChannel
} from 'discord.js';
import { VoteLogger } from '../../command_modules/logger/loggers/VoteLogger';
import { Printer } from '../../../console/Printer';
import { EmojiReader } from '../../../dal/readers/EmojiReader';
import { WrongArgumentError } from '../../../errors/command_errors/WrongArgumentError';
import { CommandError } from '../../../errors/command_errors/CommandError';
import { ExecutionError } from '../../../errors/ExecutionError';

export class VoteCommand extends Command
{
    private voteMessage: Message;
    private messageEmbed: MessageEmbed;
    private collector: ReactionCollector;
    private votes: Map<User, MessageReaction> = new Map();
    private reactions: Map<MessageReaction, Array<User>> = new Map();
    // persistent parameters
    private usingEmbed: boolean;
    private params: Params;

    public constructor(bot: Bot)
    {
        super("vote", bot);
    }

    public get title(): string 
    {
        return this.params.title;
    }

    public async execute(message: Message): Promise<void> 
    {
        this.params = this.getParams(this.parseMessage(message), message);

        Printer.title("starting vote");
        Printer.args(
            ["timeout", "vote reason", "vote channel id", "holding message (id)"],
            [`${this.params.timeout}`, this.params.title, this.params.channel?.id, `${this.params.hostMessageID}`]);

        if (this.params.channel)
        {
            let logger = new VoteLogger();
            let id = logger.logVote(this);
            this.bot.logger.addLogger(logger);

            let voteTime: string = "";
            if (this.params.timeout == undefined)
            {
                voteTime = "no limit";
            }
            else
            {
                voteTime = `${this.params.timeout / 1000} seconds`;
            }

            if (this.params.hostMessageID)
            {
                this.usingEmbed = true;
                await this.attachVoteToEmbed(this.params.channel, this.params.hostMessageID, this.params.emojis);
            }
            else
            {
                await this.createVoteEmbed(voteTime, id, this.params.channel, this.params.emojis);
            }

            if (this.voteMessage.author.tag == this.bot.client.user.tag)
            {
                this.collector = this.createReactionCollector(this.params.timeout, this.params.emojis);
            }
            else
            {
                throw new WrongArgumentError(this, "The vote command failed. Check syntax or see if the message used to host the vote was sent by me");
            }
        }
    }

    public end(reason?: string): void
    {
        if (this.collector)
        {
            this.collector.stop(reason);
        }
    }

    private createReactionCollector(timeout: number, emojis: Array<Emoji>): ReactionCollector
    {
        let filter = (reaction: MessageReaction, user: User) => !user.bot;
        var collector = this.voteMessage.createReactionCollector(filter, { time: timeout, dispose: true });

        // using lambdas to keep context to this object
        collector.on('collect', (reaction: MessageReaction, user: User) => this.onCollectorCollect(reaction, user));

        collector.on('remove', (reaction: MessageReaction, user: User) => this.onCollectorRemove(reaction, user));

        collector.on('end', () => this.onCollectorEnd());

        emojis.forEach(emoji =>
        {
            this.voteMessage.react(emoji.name)
                .catch((e) =>
                {
                    Printer.warn("Could not react to vote message for emoji : " + emoji.name);
                    Printer.error(e);
                });
        });

        this.voteMessage.pin();

        return collector;
    }

    private async createVoteEmbed(voteTime: string, id: number, channel: TextChannel, emojis: Array<Emoji>): Promise<void>
    {
        this.messageEmbed = new MessageEmbed()
            .setTitle(this.title)
            .addField("Time limit", voteTime)
            .setFooter("Vote id : " + id);

        this.voteMessage = await channel.send(this.messageEmbed);

        try
        {
            let greenCheck: string = EmojiReader.getEmoji("green_check");
            let greenCross: string = EmojiReader.getEmoji("green_cross");

            emojis.push(new Emoji(this.bot.client, { name: greenCheck }));
            emojis.push(new Emoji(this.bot.client, { name: greenCross }));
        }
        catch (error)
        {
            throw new CommandError(
                "Uh oh something broke... A technician will fix this, give it little bit of time and try again !",
                this,
                error as ExecutionError);
        }
    }

    private async attachVoteToEmbed(channel: TextChannel, hostMessageID: string | Snowflake, emojis: Array<Emoji>): Promise<void>
    {
        // attach to a existing embed
        let hostMessage = await channel.messages.fetch(hostMessageID);
        if (hostMessage.embeds.length > 0)
        {
            this.messageEmbed = hostMessage.embeds[0];

            // creates a emoji for each field name in the embed
            this.messageEmbed.fields.forEach(field =>
            {
                let emoji: Emoji = undefined;

                // emoji can be build from field name or field value
                try
                {
                    emoji = new Emoji(this.bot.client, { name: field.name });
                }
                catch (e)
                {
                    try
                    {
                        emoji = new Emoji(this.bot.client, { name: field.value });
                    }
                    catch (e) { }
                }

                if (emoji)
                {
                    emojis.push(emoji);
                }
            });
        }
        else
        {
            throw new WrongArgumentError(this, "Message to use as vote message was not an embed, thus it cannot be used");
        }

        this.voteMessage = hostMessage;
    }

    private onCollectorCollect(reaction: MessageReaction, user: User): void
    {
        this.votes.set(user, reaction);
        if (this.reactions.has(reaction))
        {
            this.reactions.get(reaction).push(user);
        }
        else
        {
            this.reactions.set(reaction, new Array<User>());
            this.reactions.get(reaction).push(user);
        }
    }

    private onCollectorRemove(reaction: MessageReaction, user: User): void
    {
        this.votes.delete(user);

        //remove from array
        let users = this.reactions.get(reaction);
        let newUsers = new Array<User>();

        users.forEach(value =>
        {
            if (value.tag != user.tag)
            {
                newUsers.push(value);
            }   
        });

        this.reactions.set(reaction, newUsers);
    }

    private onCollectorEnd(): void
    {
        this.emit("end");

        this.voteMessage.edit("**Vote ended !**");

        let embed = new MessageEmbed()
            .setColor(this.messageEmbed.color)
            .setTitle("Results for " + this.messageEmbed.title);

        //copy old embed
        if (this.usingEmbed)
        {
            this.messageEmbed.fields.forEach(field =>
            {
                embed.addField(field.name, field.value, true);
            });
        }

        //get reactions
        this.reactions.forEach((users, reaction) =>
        {
            let emoji = reaction.emoji.name;
            let votes = "";
            if (this.params.displayUsers)
            {
                users.forEach(user =>
                {
                    votes += `<@${user.id}>, `;
                });
            }
            else
            {
                votes += users.length;
            }
            embed.addField(emoji, votes, true);
        });

        // clean
        this.voteMessage.edit(embed);
        this.voteMessage.reactions.removeAll();
    }

    private getParams(map: Map<string, string>, message: Message): Params
    {
        let timeout: number = 60000;
        let title: string = "Yes/No";
        let channel: TextChannel;
        let hostMessageID: Snowflake;
        let emojis: Array<Emoji> = new Array();
        let displayUsers = false;

        let newTitle = this.getValue(map, ["r", "title"]);
        if (newTitle != "")
        {
            title = newTitle;
        }

        if (!Number.isNaN(Number.parseInt(this.getValue(map, ["timeout", "n"]))))
        {
            timeout = Number.parseInt(map.get("timeout"));
        }
        else if (this.getValue(map, ["timeout", "n"]) == "nolimit")
        {
            timeout = undefined;
        }

        channel = this.resolveTextChannel(map, message);

        let value = this.getValue(map, ["m", "message"]);
        let desconstructedSnowflake = SnowflakeUtil.deconstruct(value);
        if (desconstructedSnowflake)
        {
            hostMessageID = value;
        }

        if (this.getValue(map, ["reactions", "e"]))
        {
            let names = this.getValue(map, ["reaction", "e"]).split(" ");
            names.forEach(emoji =>
            {
                try
                {
                    emojis.push(new Emoji(this.bot.client, emoji as Object));
                } catch (error) { }
            })
        }

        if (map.has("displayusers"))
        {
            if (map.get("displayusers"))
            {
                if (map.get("displayusers").toLowerCase() == "true"
                    || map.get("displayusers").toLowerCase() == "yes"
                    || map.get("displayusers").toLowerCase() == "y")
                {
                    displayUsers = true;
                }
            }
            else
            {
                displayUsers = true;
            }
        }

        return { timeout, title, channel, hostMessageID, emojis, displayUsers };
    }
}

interface Params
{
    timeout: number;
    title: string;
    channel: TextChannel;
    hostMessageID: Snowflake;
    emojis: Array<Emoji>;
    displayUsers: boolean;
}