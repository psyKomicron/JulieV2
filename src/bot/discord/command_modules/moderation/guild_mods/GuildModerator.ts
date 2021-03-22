import { Guild, User, Message } from "discord.js";
import { MessageWrapper } from "../../../../common/MessageWrapper";
import { ResponseStatus } from "../Moderator";

export class GuildModerator
{
    private readonly guild: Guild;
    private _level: number;
    private users: Map<User, ResponseStatus> = new Map();

    public constructor(guild: Guild, level: number = 3)
    {
        this.guild = guild;
        this._level = level;
    }

    public set level(level: number) { this._level = level; }
    public get level() { return this._level; }

    public handle(wrapper: MessageWrapper): ResponseStatus
    {
        let status: ResponseStatus;
        if (this.users.get(wrapper.message.author) == ResponseStatus.BAN)
        {
            status = ResponseStatus.BAN;
            wrapper.delete(100);
        }
        return status;
    }

    public ban(user: User): void
    {
        this.users.set(user, ResponseStatus.BAN);
    }

    private checkContent(content: string): void
    {
        let regex = new RegExp(/(qwerty)/g);
        let source = regex.source.replace(/(\(|\))/g, "");
        source += "|iam";
        let pRegex = new RegExp(`/${source}/g`);
    }
}